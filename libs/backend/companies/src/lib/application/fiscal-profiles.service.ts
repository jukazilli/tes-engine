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
import { TenantSqlRepository } from '../infrastructure/tenant-sql.repository';

interface FiscalProfileRow {
  id: string;
  branch_id: string;
  tax_regime_code: string;
  nfe_crt_code: string;
  icms_taxpayer_indicator: string;
  protheus_parameter_name: string | null;
  protheus_parameter_value: string | null;
  protheus_parameter_normalized_value: string | null;
  source_type: string;
  source_reference: string | null;
  valid_from: string;
  valid_until: string | null;
  status: string;
  version: number;
}

export interface FiscalProfileInput {
  taxRegimeCode: string;
  nfeCrtCode: string;
  icmsTaxpayerIndicator: string;
  protheusParameterName?: string | null;
  protheusParameterValue?: string | null;
  protheusParameterNormalizedValue?: string | null;
  sourceType: string;
  sourceReference?: string | null;
  validFrom: string;
  validUntil?: string | null;
}

export interface FiscalProfileView {
  id: string;
  branchId: string;
  taxRegimeCode: string;
  nfeCrtCode: string;
  icmsTaxpayerIndicator: string;
  sourceType: string;
  validFrom: string;
  validUntil: string | null;
  status: string;
  version: number;
}

@Injectable()
export class FiscalProfilesService {
  constructor(
    private readonly repository: TenantSqlRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(FiscalProfilesService.name);
  }

  async list(context: OrganizationRequestContext, branchId: string): Promise<FiscalProfileView[]> {
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        await this.requireBranch(client, context.organizationId, branchId);
        return await client.query<FiscalProfileRow>(
          `
          SELECT id, branch_id, tax_regime_code, nfe_crt_code, icms_taxpayer_indicator,
            protheus_parameter_name, protheus_parameter_value, protheus_parameter_normalized_value,
            source_type, source_reference, valid_from::text, valid_until::text, status, version
          FROM app.branch_fiscal_profiles
          WHERE organization_id = $1 AND branch_id = $2 AND deleted_at IS NULL
          ORDER BY valid_from DESC, created_at DESC
          `,
          [context.organizationId, branchId],
        );
      },
    );
    return result.rows.map((row) => this.toView(row));
  }

  async create(
    context: OrganizationRequestContext,
    branchId: string,
    input: FiscalProfileInput,
  ): Promise<FiscalProfileView> {
    this.validateInput(input);
    try {
      const row = await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          await this.requireBranch(client, context.organizationId, branchId);
          const status = input.sourceType === 'SYSTEM_INFERENCE' ? 'DRAFT' : 'PENDING_REVIEW';
          const inserted = await client.query<FiscalProfileRow>(
            `
            INSERT INTO app.branch_fiscal_profiles (
              id, organization_id, branch_id, tax_regime_code, nfe_crt_code,
              icms_taxpayer_indicator, protheus_parameter_name, protheus_parameter_value,
              protheus_parameter_normalized_value, source_type, source_reference, valid_from,
              valid_until, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id, branch_id, tax_regime_code, nfe_crt_code, icms_taxpayer_indicator,
              protheus_parameter_name, protheus_parameter_value, protheus_parameter_normalized_value,
              source_type, source_reference, valid_from::text, valid_until::text, status, version
            `,
            [
              randomUUID(),
              context.organizationId,
              branchId,
              input.taxRegimeCode,
              input.nfeCrtCode,
              input.icmsTaxpayerIndicator,
              input.protheusParameterName ?? null,
              input.protheusParameterValue ?? null,
              input.protheusParameterNormalizedValue ?? null,
              input.sourceType,
              input.sourceReference ?? null,
              input.validFrom,
              input.validUntil ?? null,
              status,
            ],
          );
          return inserted.rows[0];
        },
      );
      this.logger.info(
        { organizationId: context.organizationId, branchId, profileId: row.id },
        'branch_fiscal_profile.created',
      );
      return this.toView(row);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async current(context: OrganizationRequestContext, branchId: string): Promise<FiscalProfileView> {
    return await this.atDate(context, branchId, new Date().toISOString().slice(0, 10));
  }

  async atDate(
    context: OrganizationRequestContext,
    branchId: string,
    date: string,
  ): Promise<FiscalProfileView> {
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        await this.requireBranch(client, context.organizationId, branchId);
        return await client.query<FiscalProfileRow>(
          `
          SELECT id, branch_id, tax_regime_code, nfe_crt_code, icms_taxpayer_indicator,
            protheus_parameter_name, protheus_parameter_value, protheus_parameter_normalized_value,
            source_type, source_reference, valid_from::text, valid_until::text, status, version
          FROM app.branch_fiscal_profiles
          WHERE organization_id = $1
            AND branch_id = $2
            AND status = 'CONFIRMED'
            AND deleted_at IS NULL
            AND valid_from <= $3::date
            AND (valid_until IS NULL OR valid_until >= $3::date)
          ORDER BY valid_from DESC
          LIMIT 1
          `,
          [context.organizationId, branchId, date],
        );
      },
    );
    if (result.rowCount !== 1) {
      throw new NotFoundException('BRANCH_FISCAL_PROFILE_NOT_FOUND');
    }
    return this.toView(result.rows[0]);
  }

  async update(
    context: OrganizationRequestContext,
    branchId: string,
    profileId: string,
    input: FiscalProfileInput & { status?: string; version: number },
  ): Promise<FiscalProfileView> {
    this.validateInput(input);
    try {
      const row = await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          await this.requireBranch(client, context.organizationId, branchId);
          const current = await this.requireProfile(
            client,
            context.organizationId,
            branchId,
            profileId,
          );
          if (current.status === 'CONFIRMED') {
            throw new ConflictException('CONFIRMED_PROFILE_IMMUTABLE');
          }
          const updated = await client.query<FiscalProfileRow>(
            `
            UPDATE app.branch_fiscal_profiles
            SET tax_regime_code = $4,
              nfe_crt_code = $5,
              icms_taxpayer_indicator = $6,
              protheus_parameter_name = $7,
              protheus_parameter_value = $8,
              protheus_parameter_normalized_value = $9,
              source_type = $10,
              source_reference = $11,
              valid_from = $12,
              valid_until = $13,
              status = COALESCE($14, status),
              updated_at = now(),
              version = version + 1
            WHERE organization_id = $1 AND branch_id = $2 AND id = $3 AND version = $15 AND deleted_at IS NULL
            RETURNING id, branch_id, tax_regime_code, nfe_crt_code, icms_taxpayer_indicator,
              protheus_parameter_name, protheus_parameter_value, protheus_parameter_normalized_value,
              source_type, source_reference, valid_from::text, valid_until::text, status, version
            `,
            [
              context.organizationId,
              branchId,
              profileId,
              input.taxRegimeCode,
              input.nfeCrtCode,
              input.icmsTaxpayerIndicator,
              input.protheusParameterName ?? null,
              input.protheusParameterValue ?? null,
              input.protheusParameterNormalizedValue ?? null,
              input.sourceType,
              input.sourceReference ?? null,
              input.validFrom,
              input.validUntil ?? null,
              input.status ?? null,
              input.version,
            ],
          );
          if (updated.rowCount !== 1) {
            throw new ConflictException('VERSION_CONFLICT');
          }
          return updated.rows[0];
        },
      );
      this.logger.info(
        { organizationId: context.organizationId, branchId, profileId },
        'branch_fiscal_profile.updated',
      );
      return this.toView(row);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async confirm(
    context: OrganizationRequestContext,
    branchId: string,
    profileId: string,
  ): Promise<FiscalProfileView> {
    try {
      const row = await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          const current = await this.requireProfile(
            client,
            context.organizationId,
            branchId,
            profileId,
          );
          if (current.source_type === 'SYSTEM_INFERENCE') {
            throw new UnprocessableEntityException('SYSTEM_INFERENCE_CANNOT_START_CONFIRMED');
          }
          const updated = await client.query<FiscalProfileRow>(
            `
            UPDATE app.branch_fiscal_profiles
            SET status = 'CONFIRMED',
              confirmed_by_user_id = $4,
              confirmed_at = now(),
              updated_at = now(),
              version = version + 1
            WHERE organization_id = $1 AND branch_id = $2 AND id = $3 AND deleted_at IS NULL
            RETURNING id, branch_id, tax_regime_code, nfe_crt_code, icms_taxpayer_indicator,
              protheus_parameter_name, protheus_parameter_value, protheus_parameter_normalized_value,
              source_type, source_reference, valid_from::text, valid_until::text, status, version
            `,
            [context.organizationId, branchId, profileId, context.user.userId],
          );
          return updated.rows[0];
        },
      );
      this.logger.info(
        { organizationId: context.organizationId, branchId, profileId },
        'branch_fiscal_profile.confirmed',
      );
      return this.toView(row);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async deactivate(
    context: OrganizationRequestContext,
    branchId: string,
    profileId: string,
  ): Promise<void> {
    await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        await this.requireProfile(client, context.organizationId, branchId, profileId);
        await client.query(
          `
          UPDATE app.branch_fiscal_profiles
          SET status = 'DEACTIVATED', deleted_at = now(), updated_at = now(), version = version + 1
          WHERE organization_id = $1 AND branch_id = $2 AND id = $3 AND deleted_at IS NULL
          `,
          [context.organizationId, branchId, profileId],
        );
      },
    );
  }

  private validateInput(input: FiscalProfileInput): void {
    if (input.validUntil && input.validUntil < input.validFrom) {
      throw new UnprocessableEntityException('INVALID_VALIDITY_RANGE');
    }
  }

  private async requireBranch(
    client: PoolClient,
    organizationId: string,
    branchId: string,
  ): Promise<void> {
    const branch = await client.query(
      'SELECT 1 FROM app.branches WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL',
      [organizationId, branchId],
    );
    if (branch.rowCount !== 1) {
      throw new NotFoundException('BRANCH_NOT_FOUND');
    }
  }

  private async requireProfile(
    client: PoolClient,
    organizationId: string,
    branchId: string,
    profileId: string,
  ): Promise<FiscalProfileRow> {
    const result = await client.query<FiscalProfileRow>(
      `
      SELECT id, branch_id, tax_regime_code, nfe_crt_code, icms_taxpayer_indicator,
        protheus_parameter_name, protheus_parameter_value, protheus_parameter_normalized_value,
        source_type, source_reference, valid_from::text, valid_until::text, status, version
      FROM app.branch_fiscal_profiles
      WHERE organization_id = $1 AND branch_id = $2 AND id = $3 AND deleted_at IS NULL
      LIMIT 1
      `,
      [organizationId, branchId, profileId],
    );
    if (result.rowCount !== 1) {
      throw new NotFoundException('BRANCH_FISCAL_PROFILE_NOT_FOUND');
    }
    return result.rows[0];
  }

  private toView(row: FiscalProfileRow): FiscalProfileView {
    return {
      id: row.id,
      branchId: row.branch_id,
      taxRegimeCode: row.tax_regime_code,
      nfeCrtCode: row.nfe_crt_code,
      icmsTaxpayerIndicator: row.icms_taxpayer_indicator,
      sourceType: row.source_type,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      status: row.status,
      version: row.version,
    };
  }

  private mapDatabaseError(error: unknown): never {
    if (error instanceof Error && error.message.includes('BRANCH_FISCAL_PROFILE_OVERLAP')) {
      throw new ConflictException('BRANCH_FISCAL_PROFILE_OVERLAP');
    }
    throw error;
  }
}
