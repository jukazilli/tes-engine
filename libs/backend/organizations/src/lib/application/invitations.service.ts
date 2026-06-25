import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { PinoLogger } from 'nestjs-pino';
import { PoolClient } from 'pg';
import {
  OrganizationRequestContext,
  AuthenticatedUserContext,
} from '../context/organization-request-context';
import { invalidInvitation, resourceNotFound } from '../domain/organization.errors';
import { InvitationPublic } from '../domain/invitation';
import { TenantPgRepository } from '../infrastructure/tenant-pg.repository';
import { RequestAuthService } from './request-auth.service';
import { OrganizationMailerService } from './organization-mailer.service';
import { OrganizationRateLimitService } from './organization-rate-limit.service';

interface InvitationRow {
  id: string;
  invited_email: string;
  invited_email_normalized: string;
  status: InvitationPublic['status'];
  role_id: string;
  role_code: string;
  role_name: string;
  organization_name: string;
  created_at: Date;
  last_sent_at: Date;
  expires_at: Date;
  resend_count: number;
  version: number;
}

@Injectable()
export class InvitationsService {
  constructor(
    private readonly repository: TenantPgRepository,
    private readonly requestAuthService: RequestAuthService,
    private readonly mailer: OrganizationMailerService,
    private readonly rateLimit: OrganizationRateLimitService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(InvitationsService.name);
  }

  async create(
    context: OrganizationRequestContext,
    input: { email: string; roleCode: string },
  ): Promise<InvitationPublic> {
    const email = this.normalizeEmail(input.email);
    const token = this.createToken();
    const tokenHash = this.requestAuthService.digest(token);
    const ttlSeconds = Number(
      this.configService.get('ORGANIZATION_INVITATION_TTL_SECONDS') ?? 604800,
    );
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const row = await this.repository.withTransaction(
      async (client) => {
        const activeMember = await client.query(
          `
          SELECT 1 FROM app.organization_memberships
          JOIN app.users ON users.id = organization_memberships.user_id
          WHERE organization_memberships.organization_id = $1
            AND organization_memberships.status = 'ACTIVE'
            AND organization_memberships.deleted_at IS NULL
            AND lower(users.email) = $2
          LIMIT 1
          `,
          [context.organizationId, email],
        );
        if (activeMember.rowCount) {
          throw new ConflictException('MEMBER_ALREADY_ACTIVE');
        }

        const role = await client.query<{ id: string; name: string }>(
          `
          SELECT id, name FROM app.roles
          WHERE upper(code) = $1 AND is_assignable = true
          LIMIT 1
          `,
          [input.roleCode.trim().toUpperCase()],
        );
        if (role.rowCount !== 1) {
          throw new ConflictException('ROLE_NOT_ASSIGNABLE');
        }

        const inserted = await client.query<InvitationRow>(
          `
          INSERT INTO app.organization_invitations
            (organization_id, invited_email, invited_email_normalized, token_hash, role_id,
             created_by_user_id, last_sent_at, expires_at)
          VALUES ($1, $2, $3, $4, $5, $6, now(), $7)
          RETURNING id, invited_email, invited_email_normalized, status, role_id,
            created_at, last_sent_at, expires_at, resend_count, version
          `,
          [
            context.organizationId,
            input.email.trim(),
            email,
            tokenHash,
            role.rows[0].id,
            context.user.userId,
            expiresAt,
          ],
        );
        return await this.hydrateInvitation(client, inserted.rows[0].id);
      },
      { organizationId: context.organizationId, userId: context.user.userId },
    );

    await this.sendAndRecord(row, token, context.user.userId);
    this.logger.info(
      { organizationId: context.organizationId, invitationId: row.id },
      'invitation_created',
    );
    return this.toPublic(row);
  }

  async list(context: OrganizationRequestContext): Promise<InvitationPublic[]> {
    const result = await this.repository.withTransaction(
      async (client) =>
        await client.query<InvitationRow>(
          `
          SELECT organization_invitations.id,
            organization_invitations.invited_email,
            organization_invitations.invited_email_normalized,
            organization_invitations.status,
            organization_invitations.role_id,
            roles.code AS role_code,
            roles.name AS role_name,
            organizations.name AS organization_name,
            organization_invitations.created_at,
            organization_invitations.last_sent_at,
            organization_invitations.expires_at,
            organization_invitations.resend_count,
            organization_invitations.version
          FROM app.organization_invitations
          JOIN app.roles ON roles.id = organization_invitations.role_id
          JOIN app.organizations ON organizations.id = organization_invitations.organization_id
          WHERE organization_invitations.organization_id = $1
          ORDER BY organization_invitations.created_at DESC
          `,
          [context.organizationId],
        ),
      { organizationId: context.organizationId, userId: context.user.userId },
    );
    return result.rows.map((row) => this.toPublic(row));
  }

  async resend(
    context: OrganizationRequestContext,
    invitationId: string,
    ip?: string,
  ): Promise<InvitationPublic> {
    this.rateLimit.consume({
      key: `invitation-resend:${context.organizationId}:${ip ?? 'no-ip'}`,
      limit: Number(this.configService.get('ORGANIZATION_INVITATION_RESEND_LIMIT') ?? 3),
      windowSeconds: Number(
        this.configService.get('ORGANIZATION_INVITATION_RESEND_WINDOW_SECONDS') ?? 3600,
      ),
    });
    const token = this.createToken();
    const tokenHash = this.requestAuthService.digest(token);
    const expiresAt = new Date(
      Date.now() +
        Number(this.configService.get('ORGANIZATION_INVITATION_TTL_SECONDS') ?? 604800) * 1000,
    );

    const row = await this.repository.withTransaction(
      async (client) => {
        const updated = await client.query(
          `
          UPDATE app.organization_invitations
          SET token_hash = $3,
            expires_at = $4,
            last_sent_at = now(),
            resend_count = resend_count + 1,
            version = version + 1
          WHERE id = $1 AND organization_id = $2 AND status = 'PENDING' AND expires_at > now()
          RETURNING id
          `,
          [invitationId, context.organizationId, tokenHash, expiresAt],
        );
        if (updated.rowCount !== 1) {
          throw resourceNotFound();
        }
        return await this.hydrateInvitation(client, invitationId);
      },
      { organizationId: context.organizationId, userId: context.user.userId },
    );

    await this.sendAndRecord(row, token, context.user.userId);
    this.logger.info({ organizationId: context.organizationId, invitationId }, 'invitation_resent');
    return this.toPublic(row);
  }

  async revoke(context: OrganizationRequestContext, invitationId: string): Promise<void> {
    await this.repository.withTransaction(
      async (client) => {
        const result = await client.query(
          `
          UPDATE app.organization_invitations
          SET status = 'REVOKED', revoked_at = now(), version = version + 1
          WHERE id = $1 AND organization_id = $2 AND status = 'PENDING'
          `,
          [invitationId, context.organizationId],
        );
        if (result.rowCount !== 1) {
          throw resourceNotFound();
        }
      },
      { organizationId: context.organizationId, userId: context.user.userId },
    );
    this.logger.info(
      { organizationId: context.organizationId, invitationId },
      'invitation_revoked',
    );
  }

  async preview(
    token: string,
  ): Promise<{ organizationName: string; roleName: string; expiresAt: string }> {
    const result = await this.repository.query<InvitationRow>(
      `
      SELECT organization_invitations.id,
        organization_invitations.invited_email,
        organization_invitations.invited_email_normalized,
        organization_invitations.status,
        organization_invitations.role_id,
        roles.code AS role_code,
        roles.name AS role_name,
        organizations.name AS organization_name,
        organization_invitations.created_at,
        organization_invitations.last_sent_at,
        organization_invitations.expires_at,
        organization_invitations.resend_count,
        organization_invitations.version
      FROM app.organization_invitations
      JOIN app.roles ON roles.id = organization_invitations.role_id
      JOIN app.organizations ON organizations.id = organization_invitations.organization_id
      WHERE organization_invitations.token_hash = $1
        AND organization_invitations.status = 'PENDING'
        AND organization_invitations.expires_at > now()
      LIMIT 1
      `,
      [this.requestAuthService.digest(token)],
    );
    const row = result.rows[0];
    if (!row) {
      throw invalidInvitation();
    }
    return {
      organizationName: row.organization_name,
      roleName: row.role_name,
      expiresAt: row.expires_at.toISOString(),
    };
  }

  async accept(user: AuthenticatedUserContext, token: string): Promise<void> {
    const tokenHash = this.requestAuthService.digest(token);
    const invitationResult = await this.repository.query<
      InvitationRow & { organization_id: string }
    >(
      `
      SELECT organization_invitations.id,
        organization_invitations.organization_id,
        organization_invitations.invited_email,
        organization_invitations.invited_email_normalized,
        organization_invitations.status,
        organization_invitations.role_id,
        roles.code AS role_code,
        roles.name AS role_name,
        organizations.name AS organization_name,
        organization_invitations.created_at,
        organization_invitations.last_sent_at,
        organization_invitations.expires_at,
        organization_invitations.resend_count,
        organization_invitations.version
      FROM app.organization_invitations
      JOIN app.roles ON roles.id = organization_invitations.role_id
      JOIN app.organizations ON organizations.id = organization_invitations.organization_id
      WHERE organization_invitations.token_hash = $1
      LIMIT 1
      `,
      [tokenHash],
    );
    const invitation = invitationResult.rows[0];
    if (
      !invitation ||
      invitation.status !== 'PENDING' ||
      invitation.expires_at <= new Date() ||
      invitation.invited_email_normalized !== this.normalizeEmail(user.email)
    ) {
      throw invalidInvitation();
    }

    await this.repository.withTransaction(
      async (client) => {
        const active = await client.query(
          `
          SELECT 1 FROM app.organization_memberships
          WHERE organization_id = $1 AND user_id = $2 AND status = 'ACTIVE' AND deleted_at IS NULL
          LIMIT 1
          `,
          [invitation.organization_id, user.userId],
        );
        if (active.rowCount) {
          throw new ConflictException('MEMBER_ALREADY_ACTIVE');
        }

        const membership = await client.query<{ id: string }>(
          `
          INSERT INTO app.organization_memberships
            (organization_id, user_id, status, joined_at)
          VALUES ($1, $2, 'ACTIVE', now())
          ON CONFLICT DO NOTHING
          RETURNING id
          `,
          [invitation.organization_id, user.userId],
        );
        const membershipId =
          membership.rows[0]?.id ??
          (
            await client.query<{ id: string }>(
              `
              UPDATE app.organization_memberships
              SET status = 'ACTIVE', joined_at = COALESCE(joined_at, now()), deleted_at = NULL
              WHERE organization_id = $1 AND user_id = $2
              RETURNING id
              `,
              [invitation.organization_id, user.userId],
            )
          ).rows[0].id;

        await client.query(
          `
          INSERT INTO app.membership_roles
            (organization_id, membership_id, role_id, assigned_by_user_id)
          VALUES ($1, $2, $3, $4)
          `,
          [invitation.organization_id, membershipId, invitation.role_id, user.userId],
        );
        await client.query(
          `
          UPDATE app.organization_invitations
          SET status = 'ACCEPTED', accepted_by_user_id = $2, accepted_at = now(), version = version + 1
          WHERE id = $1 AND status = 'PENDING'
          `,
          [invitation.id, user.userId],
        );
      },
      { organizationId: invitation.organization_id, userId: user.userId },
    );
    this.logger.info(
      { organizationId: invitation.organization_id, invitationId: invitation.id },
      'invitation_accepted',
    );
  }

  private async hydrateInvitation(client: PoolClient, id: string): Promise<InvitationRow> {
    const result = await client.query<InvitationRow>(
      `
      SELECT organization_invitations.id,
        organization_invitations.invited_email,
        organization_invitations.invited_email_normalized,
        organization_invitations.status,
        organization_invitations.role_id,
        roles.code AS role_code,
        roles.name AS role_name,
        organizations.name AS organization_name,
        organization_invitations.created_at,
        organization_invitations.last_sent_at,
        organization_invitations.expires_at,
        organization_invitations.resend_count,
        organization_invitations.version
      FROM app.organization_invitations
      JOIN app.roles ON roles.id = organization_invitations.role_id
      JOIN app.organizations ON organizations.id = organization_invitations.organization_id
      WHERE organization_invitations.id = $1
      LIMIT 1
      `,
      [id],
    );
    if (result.rowCount !== 1) {
      throw resourceNotFound();
    }
    return result.rows[0];
  }

  private async sendAndRecord(row: InvitationRow, token: string, userId: string): Promise<void> {
    const result = await this.mailer.sendInvitation({
      to: row.invited_email,
      organizationName: row.organization_name,
      roleName: row.role_name,
      expiresAt: row.expires_at,
      token,
    });
    await this.repository.query(
      `
      INSERT INTO app.email_delivery_events
        (user_id, message_type, provider, provider_message_id, recipient_fingerprint, status)
      VALUES ($1, 'organization_invitation', $2, $3, $4, 'SENT')
      `,
      [
        userId,
        result.provider,
        result.providerMessageId ?? null,
        this.requestAuthService.fingerprint(row.invited_email_normalized),
      ],
    );
  }

  private createToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toPublic(row: InvitationRow): InvitationPublic {
    return {
      id: row.id,
      invitedEmail: row.invited_email,
      status: row.status,
      roleCode: row.role_code,
      roleName: row.role_name,
      createdAt: row.created_at.toISOString(),
      lastSentAt: row.last_sent_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      resendCount: row.resend_count,
      version: row.version,
    };
  }
}
