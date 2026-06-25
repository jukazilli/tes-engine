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
import {
  isValidCnpj,
  isValidMunicipalityCode,
  isValidPostalCode,
  normalizeCnpj,
  onlyDigits,
} from '../validation/cnpj.validator';
import { TenantSqlRepository } from '../infrastructure/tenant-sql.repository';
import { PageInput, decodeCursor, encodeCursor, pageLimit } from './pagination';

interface BranchRow {
  id: string;
  company_id: string;
  name: string;
  code: string | null;
  cnpj: string;
  state_registration: string | null;
  municipal_registration: string | null;
  establishment_type: string;
  is_headquarters: boolean;
  status: string;
  version: number;
  created_at: Date;
}

export interface AddressInput {
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  postalCode: string;
  cityName: string;
  municipalityIbgeCode?: string | null;
  stateCode: string;
  countryCode: string;
}

export interface BranchView {
  id: string;
  companyId: string;
  name: string;
  code: string | null;
  cnpj: string;
  establishmentType: string;
  isHeadquarters: boolean;
  status: string;
  version: number;
}

@Injectable()
export class BranchesService {
  constructor(
    private readonly repository: TenantSqlRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BranchesService.name);
  }

  async list(
    context: OrganizationRequestContext,
    companyId: string,
    input: PageInput,
  ): Promise<PageResponse<BranchView>> {
    const limit = pageLimit(input.limit);
    const cursor = decodeCursor(input.cursor);
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) =>
        await client.query<BranchRow>(
          `
          SELECT id, company_id, name, code, cnpj, state_registration, municipal_registration,
            establishment_type, is_headquarters, status, version, created_at
          FROM app.branches
          WHERE organization_id = $1 AND company_id = $2 AND deleted_at IS NULL
            AND ($3::text IS NULL OR status = $3)
            AND ($4::text IS NULL OR name ILIKE '%' || $4 || '%' OR code = $4 OR cnpj = regexp_replace($4, '\\D', '', 'g'))
            AND ($5::timestamptz IS NULL OR (created_at, id) > ($5::timestamptz, $6::uuid))
          ORDER BY created_at ASC, id ASC
          LIMIT $7
          `,
          [
            context.organizationId,
            companyId,
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
    companyId: string,
    input: {
      name: string;
      code?: string | null;
      cnpj: string;
      stateRegistration?: string | null;
      municipalRegistration?: string | null;
      establishmentType: string;
      isHeadquarters: boolean;
      address: AddressInput;
    },
  ): Promise<BranchView> {
    const cnpj = normalizeCnpj(input.cnpj);
    this.validateCnpj(cnpj);
    this.validateAddress(input.address);
    try {
      const row = await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          const company = await this.companyRoot(client, context.organizationId, companyId);
          if (!cnpj.startsWith(company.tax_id_root)) {
            throw new UnprocessableEntityException('BRANCH_CNPJ_ROOT_MISMATCH');
          }
          const inserted = await client.query<BranchRow>(
            `
            INSERT INTO app.branches (
              id, organization_id, company_id, name, code, cnpj, state_registration,
              municipal_registration, establishment_type, is_headquarters, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVE')
            RETURNING id, company_id, name, code, cnpj, state_registration, municipal_registration,
              establishment_type, is_headquarters, status, version, created_at
            `,
            [
              randomUUID(),
              context.organizationId,
              companyId,
              input.name.trim(),
              input.code?.trim() || null,
              cnpj,
              input.stateRegistration ?? null,
              input.municipalRegistration ?? null,
              input.establishmentType,
              input.isHeadquarters,
            ],
          );
          await this.upsertFiscalAddress(
            client,
            context.organizationId,
            inserted.rows[0].id,
            input.address,
          );
          return inserted.rows[0];
        },
      );
      this.logger.info(
        { organizationId: context.organizationId, branchId: row.id },
        'branch.created',
      );
      return this.toView(row);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async get(context: OrganizationRequestContext, branchId: string): Promise<BranchView> {
    const row = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => await this.requireBranch(client, context.organizationId, branchId),
    );
    return this.toView(row);
  }

  async update(
    context: OrganizationRequestContext,
    branchId: string,
    input: {
      name?: string;
      code?: string | null;
      stateRegistration?: string | null;
      municipalRegistration?: string | null;
      establishmentType?: string;
      isHeadquarters?: boolean;
      address?: AddressInput;
      version: number;
    },
  ): Promise<BranchView> {
    if (input.address) {
      this.validateAddress(input.address);
    }
    try {
      const row = await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          const updated = await client.query<BranchRow>(
            `
            UPDATE app.branches
            SET name = COALESCE($3, name),
              code = COALESCE($4, code),
              state_registration = COALESCE($5, state_registration),
              municipal_registration = COALESCE($6, municipal_registration),
              establishment_type = COALESCE($7, establishment_type),
              is_headquarters = COALESCE($8, is_headquarters),
              updated_at = now(),
              version = version + 1
            WHERE organization_id = $1 AND id = $2 AND version = $9 AND status <> 'DEACTIVATED' AND deleted_at IS NULL
            RETURNING id, company_id, name, code, cnpj, state_registration, municipal_registration,
              establishment_type, is_headquarters, status, version, created_at
            `,
            [
              context.organizationId,
              branchId,
              input.name?.trim() || null,
              input.code === undefined ? null : input.code?.trim() || null,
              input.stateRegistration ?? null,
              input.municipalRegistration ?? null,
              input.establishmentType ?? null,
              input.isHeadquarters ?? null,
              input.version,
            ],
          );
          if (updated.rowCount !== 1) {
            await this.requireBranch(client, context.organizationId, branchId);
            throw new ConflictException('VERSION_CONFLICT');
          }
          if (input.address) {
            await this.upsertFiscalAddress(client, context.organizationId, branchId, input.address);
          }
          return updated.rows[0];
        },
      );
      this.logger.info({ organizationId: context.organizationId, branchId }, 'branch.updated');
      return this.toView(row);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async deactivate(context: OrganizationRequestContext, branchId: string): Promise<void> {
    await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        await this.requireBranch(client, context.organizationId, branchId);
        const activeEnvironments = await client.query(
          `
          SELECT 1 FROM app.protheus_environments
          WHERE organization_id = $1 AND branch_id = $2 AND status = 'ACTIVE' AND deleted_at IS NULL
          LIMIT 1
          `,
          [context.organizationId, branchId],
        );
        if ((activeEnvironments.rowCount ?? 0) > 0) {
          throw new ConflictException('BRANCH_HAS_ACTIVE_ENVIRONMENTS');
        }
        await client.query(
          `
          UPDATE app.branches
          SET status = 'DEACTIVATED', deleted_at = now(), updated_at = now(), version = version + 1
          WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL
          `,
          [context.organizationId, branchId],
        );
      },
    );
    this.logger.info({ organizationId: context.organizationId, branchId }, 'branch.deactivated');
  }

  private async companyRoot(
    client: PoolClient,
    organizationId: string,
    companyId: string,
  ): Promise<{ tax_id_root: string }> {
    const result = await client.query<{ tax_id_root: string }>(
      'SELECT tax_id_root FROM app.companies WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL',
      [organizationId, companyId],
    );
    if (result.rowCount !== 1) {
      throw new NotFoundException('COMPANY_NOT_FOUND');
    }
    return result.rows[0];
  }

  private async requireBranch(
    client: PoolClient,
    organizationId: string,
    branchId: string,
  ): Promise<BranchRow> {
    const result = await client.query<BranchRow>(
      `
      SELECT id, company_id, name, code, cnpj, state_registration, municipal_registration,
        establishment_type, is_headquarters, status, version, created_at
      FROM app.branches
      WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL
      LIMIT 1
      `,
      [organizationId, branchId],
    );
    if (result.rowCount !== 1) {
      throw new NotFoundException('BRANCH_NOT_FOUND');
    }
    return result.rows[0];
  }

  private async upsertFiscalAddress(
    client: PoolClient,
    organizationId: string,
    branchId: string,
    address: AddressInput,
  ): Promise<void> {
    await client.query(
      `
      UPDATE app.branch_addresses
      SET deleted_at = now(), updated_at = now(), version = version + 1
      WHERE organization_id = $1 AND branch_id = $2 AND address_type = 'FISCAL' AND deleted_at IS NULL
      `,
      [organizationId, branchId],
    );
    await client.query(
      `
      INSERT INTO app.branch_addresses (
        id, organization_id, branch_id, address_type, street, number, complement, district,
        postal_code, city_name, municipality_ibge_code, state_code, country_code
      )
      VALUES ($1, $2, $3, 'FISCAL', $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        randomUUID(),
        organizationId,
        branchId,
        address.street.trim(),
        address.number.trim(),
        address.complement?.trim() || null,
        address.district.trim(),
        onlyDigits(address.postalCode),
        address.cityName.trim(),
        address.municipalityIbgeCode || null,
        address.stateCode,
        address.countryCode || 'BR',
      ],
    );
  }

  private validateCnpj(cnpj: string): void {
    if (!isValidCnpj(cnpj)) {
      throw new UnprocessableEntityException('INVALID_CNPJ');
    }
  }

  private validateAddress(address: AddressInput): void {
    if (!isValidPostalCode(address.postalCode)) {
      throw new UnprocessableEntityException('INVALID_POSTAL_CODE');
    }
    if (!/^[A-Z]{2}$/.test(address.stateCode)) {
      throw new UnprocessableEntityException('INVALID_STATE_CODE');
    }
    if (!isValidMunicipalityCode(address.municipalityIbgeCode)) {
      throw new UnprocessableEntityException('INVALID_MUNICIPALITY_CODE');
    }
  }

  private toPage(rows: BranchRow[], limit: number): PageResponse<BranchView> {
    const items = rows.slice(0, limit).map((row) => this.toView(row));
    const last = rows.length > limit ? rows[limit - 1] : undefined;
    return {
      items,
      nextCursor: last
        ? encodeCursor({ createdAt: last.created_at.toISOString(), id: last.id })
        : undefined,
    };
  }

  private toView(row: BranchRow): BranchView {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      code: row.code,
      cnpj: row.cnpj,
      establishmentType: row.establishment_type,
      isHeadquarters: row.is_headquarters,
      status: row.status,
      version: row.version,
    };
  }

  private mapDatabaseError(error: unknown): never {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      const constraint = 'constraint' in error ? String(error.constraint) : '';
      if (constraint.includes('branches_cnpj_active_uidx')) {
        throw new ConflictException('BRANCH_CNPJ_ALREADY_EXISTS');
      }
      if (constraint.includes('branches_headquarters_active_uidx')) {
        throw new ConflictException('BRANCH_HEADQUARTERS_ALREADY_EXISTS');
      }
    }
    if (error instanceof Error && error.message.includes('BRANCH_CNPJ_ROOT_MISMATCH')) {
      throw new UnprocessableEntityException('BRANCH_CNPJ_ROOT_MISMATCH');
    }
    throw error;
  }
}
