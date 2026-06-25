import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PinoLogger } from 'nestjs-pino';
import { OrganizationRequestContext } from '../context/organization-request-context';
import { lastAdminRequired, resourceNotFound } from '../domain/organization.errors';
import { OrganizationPublic } from '../domain/organization';
import { TenantPgRepository } from '../infrastructure/tenant-pg.repository';

interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  status: OrganizationPublic['status'];
  version: number;
}

export interface OrganizationListRow extends OrganizationRow {
  roles: string[];
}

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly repository: TenantPgRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OrganizationsService.name);
  }

  async create(input: { name: string; slug: string }, userId: string): Promise<OrganizationPublic> {
    const organizationId = randomUUID();
    const normalizedSlug = this.normalizeSlug(input.slug);
    const organization = await this.repository.withTransaction(
      async (client) => {
        const inserted = await client.query<OrganizationRow>(
          `
          INSERT INTO app.organizations (id, name, slug, status)
          VALUES ($1, $2, $3, 'ACTIVE')
          RETURNING id, name, slug, status, version
          `,
          [organizationId, input.name.trim(), normalizedSlug],
        );

        const membership = await client.query<{ id: string }>(
          `
          INSERT INTO app.organization_memberships
            (organization_id, user_id, status, joined_at)
          VALUES ($1, $2, 'ACTIVE', now())
          RETURNING id
          `,
          [organizationId, userId],
        );

        const adminRole = await client.query<{ id: string }>(
          "SELECT id FROM app.roles WHERE code = 'ADMIN' AND is_assignable = true LIMIT 1",
        );
        await client.query(
          `
          INSERT INTO app.membership_roles
            (organization_id, membership_id, role_id, assigned_by_user_id)
          VALUES ($1, $2, $3, $4)
          `,
          [organizationId, membership.rows[0].id, adminRole.rows[0].id, userId],
        );

        return inserted.rows[0];
      },
      { organizationId, userId },
    );

    this.logger.info({ organizationId, userId }, 'organization_created');
    return organization;
  }

  async listForUser(userId: string): Promise<OrganizationListRow[]> {
    const result = await this.repository.query<OrganizationListRow>(
      `
      SELECT organization_id AS id,
        organization_name AS name,
        organization_slug AS slug,
        organization_status AS status,
        role_codes AS roles,
        1 AS version
      FROM app_private.organizations_for_user($1)
      `,
      [userId],
    );
    return result.rows;
  }

  async get(context: OrganizationRequestContext): Promise<OrganizationPublic> {
    const result = await this.repository.withTransaction(
      async (client) =>
        await client.query<OrganizationRow>(
          `
          SELECT id, name, slug, status, version
          FROM app.organizations
          WHERE id = $1 AND deleted_at IS NULL
          LIMIT 1
          `,
          [context.organizationId],
        ),
      { organizationId: context.organizationId, userId: context.user.userId },
    );

    if (result.rowCount !== 1) {
      throw resourceNotFound();
    }
    return result.rows[0];
  }

  async update(
    context: OrganizationRequestContext,
    input: { name?: string; slug?: string; version: number },
  ): Promise<OrganizationPublic> {
    const name = input.name?.trim();
    const slug = input.slug ? this.normalizeSlug(input.slug) : undefined;
    const result = await this.repository.withTransaction(
      async (client) =>
        await client.query<OrganizationRow>(
          `
          UPDATE app.organizations
          SET name = COALESCE($2, name),
            slug = COALESCE($3, slug),
            updated_at = now(),
            version = version + 1
          WHERE id = $1 AND version = $4 AND status = 'ACTIVE' AND deleted_at IS NULL
          RETURNING id, name, slug, status, version
          `,
          [context.organizationId, name ?? null, slug ?? null, input.version],
        ),
      { organizationId: context.organizationId, userId: context.user.userId },
    );

    if (result.rowCount !== 1) {
      throw new ConflictException('ORGANIZATION_VERSION_CONFLICT');
    }

    this.logger.info(
      { organizationId: context.organizationId, userId: context.user.userId },
      'organization_updated',
    );
    return result.rows[0];
  }

  async deactivate(context: OrganizationRequestContext): Promise<void> {
    await this.repository.withTransaction(
      async (client) => {
        const admins = await client.query<{ membership_id: string }>(
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
          [context.organizationId],
        );
        if ((admins.rowCount ?? 0) < 1) {
          this.logger.warn({ organizationId: context.organizationId }, 'last_admin_blocked');
          throw lastAdminRequired();
        }
        await client.query(
          `
          UPDATE app.organizations
          SET status = 'SUSPENDED', updated_at = now(), version = version + 1
          WHERE id = $1 AND status = 'ACTIVE'
          `,
          [context.organizationId],
        );
      },
      { organizationId: context.organizationId, userId: context.user.userId },
    );
    this.logger.info(
      { organizationId: context.organizationId, userId: context.user.userId },
      'organization_deactivated',
    );
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }
}
