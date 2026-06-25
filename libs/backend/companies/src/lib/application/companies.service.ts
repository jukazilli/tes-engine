import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrganizationRequestContext } from '@tes-engine/backend/organizations';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { PoolClient } from 'pg';
import { PageResponse } from '../domain/contracts';
import { normalizeCnpjRoot } from '../validation/cnpj.validator';
import { TenantSqlRepository } from '../infrastructure/tenant-sql.repository';
import { PageInput, decodeCursor, encodeCursor, pageLimit } from './pagination';

interface CompanyRow {
  id: string;
  legal_name: string;
  trade_name: string | null;
  tax_id_root: string;
  tax_regime: string;
  status: string;
  version: number;
  created_at: Date;
}

export interface CompanyView {
  id: string;
  legalName: string;
  tradeName: string | null;
  taxIdRoot: string;
  taxRegime: string;
  status: string;
  version: number;
}

@Injectable()
export class CompaniesService {
  constructor(
    private readonly repository: TenantSqlRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(CompaniesService.name);
  }

  async list(
    context: OrganizationRequestContext,
    input: PageInput,
  ): Promise<PageResponse<CompanyView>> {
    const limit = pageLimit(input.limit);
    const cursor = decodeCursor(input.cursor);
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) =>
        await client.query<CompanyRow>(
          `
          SELECT id, legal_name, trade_name, tax_id_root, tax_regime, status, version, created_at
          FROM app.companies
          WHERE organization_id = $1
            AND deleted_at IS NULL
            AND ($2::text IS NULL OR status = $2)
            AND ($3::text IS NULL OR legal_name ILIKE '%' || $3 || '%' OR trade_name ILIKE '%' || $3 || '%' OR tax_id_root = $3)
            AND ($4::timestamptz IS NULL OR (created_at, id) > ($4::timestamptz, $5::uuid))
          ORDER BY created_at ASC, id ASC
          LIMIT $6
          `,
          [
            context.organizationId,
            input.status ?? null,
            input.search?.trim() || null,
            cursor?.createdAt ?? null,
            cursor?.id ?? null,
            limit + 1,
          ],
        ),
    );
    return this.toPage(result.rows, limit);
  }

  async create(
    context: OrganizationRequestContext,
    input: { legalName: string; tradeName?: string | null; taxIdRoot: string; taxRegime: string },
  ): Promise<CompanyView> {
    const taxIdRoot = normalizeCnpjRoot(input.taxIdRoot);
    if (!/^\d{8}$/.test(taxIdRoot)) {
      throw new UnprocessableEntityException('INVALID_CNPJ');
    }
    try {
      const row = await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          const inserted = await client.query<CompanyRow>(
            `
            INSERT INTO app.companies (id, organization_id, legal_name, trade_name, tax_id_root, tax_regime, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
            RETURNING id, legal_name, trade_name, tax_id_root, tax_regime, status, version, created_at
            `,
            [
              randomUUID(),
              context.organizationId,
              input.legalName.trim(),
              input.tradeName?.trim() || null,
              taxIdRoot,
              input.taxRegime,
            ],
          );
          return inserted.rows[0];
        },
      );
      this.logger.info(
        { organizationId: context.organizationId, companyId: row.id },
        'company.created',
      );
      return this.toView(row);
    } catch (error) {
      this.mapUniqueError(error, 'COMPANY_TAX_ID_ROOT_ALREADY_EXISTS');
    }
  }

  async get(context: OrganizationRequestContext, companyId: string): Promise<CompanyView> {
    const row = await this.findCompany(context, companyId);
    return this.toView(row);
  }

  async update(
    context: OrganizationRequestContext,
    companyId: string,
    input: { legalName?: string; tradeName?: string | null; taxRegime?: string; version: number },
  ): Promise<CompanyView> {
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) =>
        await client.query<CompanyRow>(
          `
          UPDATE app.companies
          SET legal_name = COALESCE($3, legal_name),
            trade_name = COALESCE($4, trade_name),
            tax_regime = COALESCE($5, tax_regime),
            updated_at = now(),
            version = version + 1
          WHERE organization_id = $1 AND id = $2 AND version = $6 AND status <> 'DEACTIVATED' AND deleted_at IS NULL
          RETURNING id, legal_name, trade_name, tax_id_root, tax_regime, status, version, created_at
          `,
          [
            context.organizationId,
            companyId,
            input.legalName?.trim() || null,
            input.tradeName === undefined ? null : input.tradeName?.trim() || null,
            input.taxRegime ?? null,
            input.version,
          ],
        ),
    );
    if (result.rowCount !== 1) {
      await this.ensureExistsOrNotFound(context, companyId);
      throw new ConflictException('VERSION_CONFLICT');
    }
    this.logger.info({ organizationId: context.organizationId, companyId }, 'company.updated');
    return this.toView(result.rows[0]);
  }

  async deactivate(context: OrganizationRequestContext, companyId: string): Promise<void> {
    await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        await this.requireCompany(client, context.organizationId, companyId);
        const activeBranches = await client.query(
          `
          SELECT 1 FROM app.branches
          WHERE organization_id = $1 AND company_id = $2 AND status = 'ACTIVE' AND deleted_at IS NULL
          LIMIT 1
          `,
          [context.organizationId, companyId],
        );
        if ((activeBranches.rowCount ?? 0) > 0) {
          throw new ConflictException('COMPANY_HAS_ACTIVE_BRANCHES');
        }
        await client.query(
          `
          UPDATE app.companies
          SET status = 'DEACTIVATED', deleted_at = now(), updated_at = now(), version = version + 1
          WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL
          `,
          [context.organizationId, companyId],
        );
      },
    );
    this.logger.info({ organizationId: context.organizationId, companyId }, 'company.deactivated');
  }

  private async findCompany(
    context: OrganizationRequestContext,
    companyId: string,
  ): Promise<CompanyRow> {
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => await this.requireCompany(client, context.organizationId, companyId),
    );
    return result;
  }

  private async ensureExistsOrNotFound(
    context: OrganizationRequestContext,
    companyId: string,
  ): Promise<void> {
    await this.findCompany(context, companyId);
  }

  private async requireCompany(
    client: PoolClient,
    organizationId: string,
    companyId: string,
  ): Promise<CompanyRow> {
    const result = await client.query<CompanyRow>(
      `
      SELECT id, legal_name, trade_name, tax_id_root, tax_regime, status, version, created_at
      FROM app.companies
      WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL
      LIMIT 1
      `,
      [organizationId, companyId],
    );
    if (result.rowCount !== 1) {
      throw new NotFoundException('COMPANY_NOT_FOUND');
    }
    return result.rows[0];
  }

  private toPage(rows: CompanyRow[], limit: number): PageResponse<CompanyView> {
    const items = rows.slice(0, limit).map((row) => this.toView(row));
    const last = rows.length > limit ? rows[limit - 1] : undefined;
    return {
      items,
      nextCursor: last
        ? encodeCursor({ createdAt: last.created_at.toISOString(), id: last.id })
        : undefined,
    };
  }

  private toView(row: CompanyRow): CompanyView {
    return {
      id: row.id,
      legalName: row.legal_name,
      tradeName: row.trade_name,
      taxIdRoot: row.tax_id_root,
      taxRegime: row.tax_regime,
      status: row.status,
      version: row.version,
    };
  }

  private mapUniqueError(error: unknown, code: string): never {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw new ConflictException(code);
    }
    throw error;
  }
}
