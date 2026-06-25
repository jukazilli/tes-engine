import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PageResponse, TenantSqlRepository } from '@tes-engine/backend/companies';
import { OrganizationRequestContext } from '@tes-engine/backend/organizations';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import {
  isValidProtheusCode,
  isValidProtheusVersion,
  normalizeProtheusCode,
} from '../validation/protheus-environment.validation';

interface EnvironmentRow {
  id: string;
  branch_id: string;
  name: string;
  environment_type: string;
  status: string;
  protheus_product: string;
  protheus_major_version: string;
  protheus_release: string;
  protheus_company_code: string;
  protheus_branch_code: string;
  description: string | null;
  version: number;
  created_at: Date;
}

export interface EnvironmentView {
  id: string;
  branchId: string;
  name: string;
  environmentType: string;
  status: string;
  protheusRelease: string;
  protheusCompanyCode: string;
  protheusBranchCode: string;
  version: number;
}

@Injectable()
export class ProtheusEnvironmentsService {
  constructor(
    private readonly repository: TenantSqlRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ProtheusEnvironmentsService.name);
  }

  async list(
    context: OrganizationRequestContext,
    input: { branchId?: string; limit?: number; status?: string },
  ): Promise<PageResponse<EnvironmentView>> {
    const limit = Math.min(Math.max(input.limit ?? 25, 1), 100);
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) =>
        await client.query<EnvironmentRow>(
          `
          SELECT id, branch_id, name, environment_type, status, protheus_product,
            protheus_major_version, protheus_release, protheus_company_code,
            protheus_branch_code, description, version, created_at
          FROM app.protheus_environments
          WHERE organization_id = $1
            AND deleted_at IS NULL
            AND ($2::uuid IS NULL OR branch_id = $2)
            AND ($3::text IS NULL OR status = $3)
          ORDER BY created_at ASC, id ASC
          LIMIT $4
          `,
          [context.organizationId, input.branchId ?? null, input.status ?? null, limit],
        ),
    );
    return { items: result.rows.map((row) => this.toView(row)) };
  }

  async create(
    context: OrganizationRequestContext,
    input: {
      branchId: string;
      name: string;
      environmentType: string;
      protheusProduct: string;
      protheusMajorVersion: string;
      protheusRelease: string;
      protheusCompanyCode: string;
      protheusBranchCode: string;
      description?: string | null;
    },
  ): Promise<EnvironmentView> {
    const normalized = this.normalizeInput(input);
    try {
      const row = await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          const branch = await client.query(
            'SELECT 1 FROM app.branches WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL',
            [context.organizationId, normalized.branchId],
          );
          if (branch.rowCount !== 1) {
            throw new NotFoundException('BRANCH_NOT_FOUND');
          }
          const inserted = await client.query<EnvironmentRow>(
            `
            INSERT INTO app.protheus_environments (
              id, organization_id, branch_id, name, environment_type, status, protheus_product,
              protheus_major_version, protheus_release, protheus_company_code,
              protheus_branch_code, description
            )
            VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6, $7, $8, $9, $10, $11)
            RETURNING id, branch_id, name, environment_type, status, protheus_product,
              protheus_major_version, protheus_release, protheus_company_code,
              protheus_branch_code, description, version, created_at
            `,
            [
              randomUUID(),
              context.organizationId,
              normalized.branchId,
              normalized.name,
              normalized.environmentType,
              'PROTHEUS',
              normalized.protheusMajorVersion,
              normalized.protheusRelease,
              normalized.protheusCompanyCode,
              normalized.protheusBranchCode,
              normalized.description ?? null,
            ],
          );
          return inserted.rows[0];
        },
      );
      this.logger.info(
        { organizationId: context.organizationId, environmentId: row.id },
        'protheus_environment.created',
      );
      return this.toView(row);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async get(context: OrganizationRequestContext, environmentId: string): Promise<EnvironmentView> {
    const row = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        const result = await client.query<EnvironmentRow>(
          `
          SELECT id, branch_id, name, environment_type, status, protheus_product,
            protheus_major_version, protheus_release, protheus_company_code,
            protheus_branch_code, description, version, created_at
          FROM app.protheus_environments
          WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL
          LIMIT 1
          `,
          [context.organizationId, environmentId],
        );
        if (result.rowCount !== 1) {
          throw new NotFoundException('ENVIRONMENT_NOT_FOUND');
        }
        return result.rows[0];
      },
    );
    return this.toView(row);
  }

  async update(
    context: OrganizationRequestContext,
    environmentId: string,
    input: {
      name?: string;
      environmentType?: string;
      protheusMajorVersion?: string;
      protheusRelease?: string;
      protheusCompanyCode?: string;
      protheusBranchCode?: string;
      description?: string | null;
      version: number;
    },
  ): Promise<EnvironmentView> {
    const normalized = this.normalizePartialInput(input);
    try {
      const result = await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) =>
          await client.query<EnvironmentRow>(
            `
            UPDATE app.protheus_environments
            SET name = COALESCE($3, name),
              environment_type = COALESCE($4, environment_type),
              protheus_major_version = COALESCE($5, protheus_major_version),
              protheus_release = COALESCE($6, protheus_release),
              protheus_company_code = COALESCE($7, protheus_company_code),
              protheus_branch_code = COALESCE($8, protheus_branch_code),
              description = COALESCE($9, description),
              updated_at = now(),
              version = version + 1
            WHERE organization_id = $1 AND id = $2 AND version = $10 AND deleted_at IS NULL AND status <> 'DEACTIVATED'
            RETURNING id, branch_id, name, environment_type, status, protheus_product,
              protheus_major_version, protheus_release, protheus_company_code,
              protheus_branch_code, description, version, created_at
            `,
            [
              context.organizationId,
              environmentId,
              normalized.name ?? null,
              normalized.environmentType ?? null,
              normalized.protheusMajorVersion ?? null,
              normalized.protheusRelease ?? null,
              normalized.protheusCompanyCode ?? null,
              normalized.protheusBranchCode ?? null,
              normalized.description ?? null,
              input.version,
            ],
          ),
      );
      if (result.rowCount !== 1) {
        await this.get(context, environmentId);
        throw new ConflictException('VERSION_CONFLICT');
      }
      this.logger.info(
        { organizationId: context.organizationId, environmentId },
        'protheus_environment.updated',
      );
      return this.toView(result.rows[0]);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async deactivate(context: OrganizationRequestContext, environmentId: string): Promise<void> {
    await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        const updated = await client.query(
          `
          UPDATE app.protheus_environments
          SET status = 'DEACTIVATED', deleted_at = now(), updated_at = now(), version = version + 1
          WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL
          `,
          [context.organizationId, environmentId],
        );
        if (updated.rowCount !== 1) {
          throw new NotFoundException('ENVIRONMENT_NOT_FOUND');
        }
      },
    );
    this.logger.info(
      { organizationId: context.organizationId, environmentId },
      'protheus_environment.deactivated',
    );
  }

  private normalizeInput<T extends { [key: string]: unknown }>(input: T): T {
    return this.normalizePartialInput(input) as T;
  }

  private normalizePartialInput<T extends { [key: string]: unknown }>(input: T): T {
    const next: Record<string, unknown> = { ...input };
    for (const key of ['protheusMajorVersion', 'protheusRelease']) {
      const value = next[key];
      if (typeof value === 'string' && !isValidProtheusVersion(value)) {
        throw new UnprocessableEntityException('INVALID_PROTHEUS_VERSION');
      }
    }
    for (const key of ['protheusCompanyCode', 'protheusBranchCode']) {
      const value = next[key];
      if (typeof value === 'string') {
        const normalized = normalizeProtheusCode(value);
        if (!isValidProtheusCode(normalized)) {
          throw new UnprocessableEntityException('INVALID_PROTHEUS_CODE');
        }
        next[key] = normalized;
      }
    }
    return next as T;
  }

  private toView(row: EnvironmentRow): EnvironmentView {
    return {
      id: row.id,
      branchId: row.branch_id,
      name: row.name,
      environmentType: row.environment_type,
      status: row.status,
      protheusRelease: row.protheus_release,
      protheusCompanyCode: row.protheus_company_code,
      protheusBranchCode: row.protheus_branch_code,
      version: row.version,
    };
  }

  private mapDatabaseError(error: unknown): never {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw new ConflictException('ENVIRONMENT_ALREADY_EXISTS');
    }
    throw error;
  }
}
