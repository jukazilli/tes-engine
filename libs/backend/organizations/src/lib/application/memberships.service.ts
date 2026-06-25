import { ConflictException, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { PoolClient } from 'pg';
import { OrganizationRequestContext } from '../context/organization-request-context';
import { lastAdminRequired, resourceNotFound } from '../domain/organization.errors';
import { MembershipPublic } from '../domain/membership';
import { TenantPgRepository } from '../infrastructure/tenant-pg.repository';

interface MembershipRow {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  status: MembershipPublic['status'];
  roles: string[];
  joined_at: Date | null;
  created_at: Date;
  version: number;
}

@Injectable()
export class MembershipsService {
  constructor(
    private readonly repository: TenantPgRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(MembershipsService.name);
  }

  async list(context: OrganizationRequestContext): Promise<MembershipPublic[]> {
    const result = await this.repository.withTransaction(
      async (client) =>
        await client.query<MembershipRow>(
          `
          SELECT organization_memberships.id,
            users.id AS user_id,
            users.display_name,
            users.email,
            organization_memberships.status,
            organization_memberships.joined_at,
            organization_memberships.created_at,
            organization_memberships.version,
            coalesce(array_agg(DISTINCT roles.code) FILTER (WHERE roles.code IS NOT NULL), '{}') AS roles
          FROM app.organization_memberships
          JOIN app.users ON users.id = organization_memberships.user_id
          LEFT JOIN app.membership_roles ON membership_roles.membership_id = organization_memberships.id
            AND membership_roles.deleted_at IS NULL
          LEFT JOIN app.roles ON roles.id = membership_roles.role_id
          WHERE organization_memberships.organization_id = $1
            AND organization_memberships.deleted_at IS NULL
          GROUP BY organization_memberships.id, users.id
          ORDER BY organization_memberships.created_at ASC
          `,
          [context.organizationId],
        ),
      { organizationId: context.organizationId, userId: context.user.userId },
    );

    return result.rows.map((row) => this.toPublic(row));
  }

  async updateStatus(
    context: OrganizationRequestContext,
    membershipId: string,
    input: { status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED'; version: number },
  ): Promise<MembershipPublic> {
    return await this.repository.withTransaction(
      async (client) => {
        if (input.status !== 'ACTIVE') {
          await this.ensureNotLastAdmin(client, context.organizationId, membershipId);
        }

        const result = await client.query<MembershipRow>(
          `
          UPDATE app.organization_memberships
          SET status = $3,
            updated_at = now(),
            version = version + 1,
            deleted_at = CASE WHEN $3 = 'REVOKED' THEN now() ELSE deleted_at END
          WHERE id = $1
            AND organization_id = $2
            AND version = $4
            AND deleted_at IS NULL
            AND NOT (status = 'REVOKED' AND $3 = 'ACTIVE')
          RETURNING id, user_id, status, joined_at, created_at, version
          `,
          [membershipId, context.organizationId, input.status, input.version],
        );
        if (result.rowCount !== 1) {
          throw new ConflictException('MEMBERSHIP_VERSION_CONFLICT');
        }
        const [membership] = await this.loadMembershipRows(
          client,
          context.organizationId,
          membershipId,
        );
        this.logger.info(
          { organizationId: context.organizationId, membershipId },
          'membership_updated',
        );
        return this.toPublic(membership);
      },
      { organizationId: context.organizationId, userId: context.user.userId },
    );
  }

  async remove(context: OrganizationRequestContext, membershipId: string): Promise<void> {
    await this.repository.withTransaction(
      async (client) => {
        await this.ensureNotLastAdmin(client, context.organizationId, membershipId);
        const result = await client.query(
          `
          UPDATE app.organization_memberships
          SET status = 'REVOKED', deleted_at = now(), updated_at = now(), version = version + 1
          WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL
          `,
          [membershipId, context.organizationId],
        );
        if (result.rowCount !== 1) {
          throw resourceNotFound();
        }
        this.logger.info(
          { organizationId: context.organizationId, membershipId },
          'membership_removed',
        );
      },
      { organizationId: context.organizationId, userId: context.user.userId },
    );
  }

  async assignRoles(
    context: OrganizationRequestContext,
    membershipId: string,
    input: { roleCodes: string[]; version: number },
  ): Promise<MembershipPublic> {
    if (input.roleCodes.length === 0) {
      throw new ConflictException('MEMBERSHIP_ROLE_REQUIRED');
    }

    return await this.repository.withTransaction(
      async (client) => {
        const normalizedCodes = [
          ...new Set(input.roleCodes.map((role) => role.trim().toUpperCase())),
        ];
        if (!normalizedCodes.includes('ADMIN')) {
          await this.ensureNotLastAdmin(client, context.organizationId, membershipId);
        }

        const membership = await client.query<{ id: string }>(
          `
          SELECT id FROM app.organization_memberships
          WHERE id = $1 AND organization_id = $2 AND version = $3 AND status = 'ACTIVE'
          FOR UPDATE
          `,
          [membershipId, context.organizationId, input.version],
        );
        if (membership.rowCount !== 1) {
          throw new ConflictException('MEMBERSHIP_VERSION_CONFLICT');
        }

        const roles = await client.query<{ id: string; code: string }>(
          `
          SELECT id, code FROM app.roles
          WHERE upper(code) = ANY($1::text[]) AND is_assignable = true
          `,
          [normalizedCodes],
        );
        if (roles.rowCount !== normalizedCodes.length) {
          throw new ConflictException('ROLE_NOT_ASSIGNABLE');
        }

        await client.query(
          `
          UPDATE app.membership_roles
          SET deleted_at = now()
          WHERE organization_id = $1 AND membership_id = $2 AND deleted_at IS NULL
          `,
          [context.organizationId, membershipId],
        );

        for (const role of roles.rows) {
          await client.query(
            `
            INSERT INTO app.membership_roles
              (organization_id, membership_id, role_id, assigned_by_user_id)
            VALUES ($1, $2, $3, $4)
            `,
            [context.organizationId, membershipId, role.id, context.user.userId],
          );
        }
        await client.query(
          `
          UPDATE app.organization_memberships
          SET version = version + 1, updated_at = now()
          WHERE id = $1
          `,
          [membershipId],
        );
        const [updated] = await this.loadMembershipRows(
          client,
          context.organizationId,
          membershipId,
        );
        this.logger.info(
          { organizationId: context.organizationId, membershipId },
          'roles_assigned',
        );
        return this.toPublic(updated);
      },
      { organizationId: context.organizationId, userId: context.user.userId },
    );
  }

  private async ensureNotLastAdmin(
    client: PoolClient,
    organizationId: string,
    membershipId: string,
  ): Promise<void> {
    const result = await client.query<{ membership_id: string }>(
      `
      SELECT organization_memberships.id AS membership_id
      FROM app.organization_memberships
      JOIN app.membership_roles ON membership_roles.membership_id = organization_memberships.id
        AND membership_roles.deleted_at IS NULL
      JOIN app.roles ON roles.id = membership_roles.role_id
      WHERE organization_memberships.organization_id = $1
        AND organization_memberships.status = 'ACTIVE'
        AND organization_memberships.deleted_at IS NULL
        AND roles.code = 'ADMIN'
      FOR UPDATE OF organization_memberships
      `,
      [organizationId],
    );
    const adminIds = result.rows.map((row: { membership_id: string }) => row.membership_id);
    if (adminIds.includes(membershipId) && adminIds.length <= 1) {
      this.logger.warn({ organizationId, membershipId }, 'last_admin_blocked');
      throw lastAdminRequired();
    }
  }

  private async loadMembershipRows(
    client: PoolClient,
    organizationId: string,
    membershipId: string,
  ): Promise<MembershipRow[]> {
    const result = await client.query<MembershipRow>(
      `
      SELECT organization_memberships.id,
        users.id AS user_id,
        users.display_name,
        users.email,
        organization_memberships.status,
        organization_memberships.joined_at,
        organization_memberships.created_at,
        organization_memberships.version,
        coalesce(array_agg(DISTINCT roles.code) FILTER (WHERE roles.code IS NOT NULL), '{}') AS roles
      FROM app.organization_memberships
      JOIN app.users ON users.id = organization_memberships.user_id
      LEFT JOIN app.membership_roles ON membership_roles.membership_id = organization_memberships.id
        AND membership_roles.deleted_at IS NULL
      LEFT JOIN app.roles ON roles.id = membership_roles.role_id
      WHERE organization_memberships.organization_id = $1
        AND organization_memberships.id = $2
      GROUP BY organization_memberships.id, users.id
      LIMIT 1
      `,
      [organizationId, membershipId],
    );
    if (result.rowCount !== 1) {
      throw resourceNotFound();
    }
    return result.rows;
  }

  private toPublic(row: MembershipRow): MembershipPublic {
    return {
      id: row.id,
      userId: row.user_id,
      displayName: row.display_name,
      email: row.email,
      status: row.status,
      roles: row.roles ?? [],
      joinedAt: row.joined_at?.toISOString(),
      createdAt: row.created_at.toISOString(),
      version: row.version,
    };
  }
}
