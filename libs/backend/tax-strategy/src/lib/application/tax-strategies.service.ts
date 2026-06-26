import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TenantSqlRepository } from '@tes-engine/backend/companies';
import { OrganizationRequestContext } from '@tes-engine/backend/organizations';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { PoolClient } from 'pg';
import { TaxDomainCode } from '../domain/tax-domain';
import { TaxStrategyInput, TaxStrategyItemInput, TaxStrategyView } from '../domain/tax-strategy';
import {
  TaxStrategyValidationResult,
  TaxStrategyValidationService,
} from './tax-strategy-validation.service';

interface StrategyRow {
  id: string;
  organization_id: string;
  environment_id: string;
  branch_id: string;
  mode: string;
  status: string;
  valid_from: string;
  valid_until: string | null;
  source_type: string;
  source_reference: string | null;
  notes: string | null;
  confirmed_at: string | null;
  version: number;
}

interface StrategyItemRow {
  id: string;
  strategy_id: string;
  tax_domain_code: string;
  owner_code: string;
  not_applicable_reason: string | null;
  notes: string | null;
  version: number;
}

@Injectable()
export class TaxStrategiesService {
  constructor(
    private readonly repository: TenantSqlRepository,
    private readonly validation: TaxStrategyValidationService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TaxStrategiesService.name);
  }

  async list(
    context: OrganizationRequestContext,
    environmentId: string,
  ): Promise<TaxStrategyView[]> {
    const rows = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        await this.requireEnvironment(client, context.organizationId, environmentId);
        const result = await client.query<StrategyRow>(
          `
          SELECT id, organization_id, environment_id, branch_id, mode, status, valid_from::text,
            valid_until::text, source_type, source_reference, notes, confirmed_at::text, version
          FROM app.environment_tax_strategies
          WHERE organization_id = $1 AND environment_id = $2 AND deleted_at IS NULL
          ORDER BY valid_from DESC, created_at DESC
          `,
          [context.organizationId, environmentId],
        );
        return result.rows;
      },
    );
    return await this.attachItems(context, rows);
  }

  async create(
    context: OrganizationRequestContext,
    environmentId: string,
    input: TaxStrategyInput,
  ): Promise<TaxStrategyView> {
    this.validatePeriod(input.validFrom, input.validUntil ?? null);
    try {
      const strategyId = await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          const environment = await this.requireEnvironment(
            client,
            context.organizationId,
            environmentId,
          );
          await this.validateInputItems(client, input.items ?? []);
          const id = randomUUID();
          await client.query(
            `
            INSERT INTO app.environment_tax_strategies (
              id, organization_id, environment_id, branch_id, mode, status, valid_from,
              valid_until, source_type, source_reference, notes
            )
            VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6, $7, $8, $9, $10)
            `,
            [
              id,
              context.organizationId,
              environmentId,
              environment.branch_id,
              input.mode,
              input.validFrom,
              input.validUntil ?? null,
              input.sourceType,
              input.sourceReference ?? null,
              input.notes ?? null,
            ],
          );
          await this.replaceItems(client, context.organizationId, id, input.items ?? []);
          return id;
        },
      );
      this.logger.info(
        { organizationId: context.organizationId, environmentId, strategyId },
        'tax_strategy.created',
      );
      return await this.get(context, environmentId, strategyId);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async current(
    context: OrganizationRequestContext,
    environmentId: string,
  ): Promise<TaxStrategyView> {
    return await this.atDate(context, environmentId, new Date().toISOString().slice(0, 10));
  }

  async atDate(
    context: OrganizationRequestContext,
    environmentId: string,
    date: string,
  ): Promise<TaxStrategyView> {
    const row = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        await this.requireEnvironment(client, context.organizationId, environmentId);
        const result = await client.query<StrategyRow>(
          `
          SELECT id, organization_id, environment_id, branch_id, mode, status, valid_from::text,
            valid_until::text, source_type, source_reference, notes, confirmed_at::text, version
          FROM app.environment_tax_strategies
          WHERE organization_id = $1
            AND environment_id = $2
            AND status = 'CONFIRMED'
            AND deleted_at IS NULL
            AND valid_from <= $3::date
            AND (valid_until IS NULL OR valid_until >= $3::date)
          ORDER BY valid_from DESC
          LIMIT 1
          `,
          [context.organizationId, environmentId, date],
        );
        if (result.rowCount !== 1) {
          throw new NotFoundException('TAX_STRATEGY_NOT_FOUND');
        }
        return result.rows[0];
      },
    );
    return (await this.attachItems(context, [row]))[0];
  }

  async get(
    context: OrganizationRequestContext,
    environmentId: string,
    strategyId: string,
  ): Promise<TaxStrategyView> {
    const row = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) =>
        await this.requireStrategy(client, context.organizationId, environmentId, strategyId),
    );
    return (await this.attachItems(context, [row]))[0];
  }

  async update(
    context: OrganizationRequestContext,
    environmentId: string,
    strategyId: string,
    input: Partial<TaxStrategyInput> & { version: number },
  ): Promise<TaxStrategyView> {
    try {
      await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          const current = await this.requireStrategy(
            client,
            context.organizationId,
            environmentId,
            strategyId,
          );
          if (current.status === 'CONFIRMED') {
            throw new ConflictException('TAX_STRATEGY_IMMUTABLE');
          }
          const validFrom = input.validFrom ?? current.valid_from;
          const validUntil =
            input.validUntil === undefined ? current.valid_until : input.validUntil;
          this.validatePeriod(validFrom, validUntil);
          if (input.items) {
            await this.validateInputItems(client, input.items);
          }
          const updated = await client.query(
            `
            UPDATE app.environment_tax_strategies
            SET mode = COALESCE($4, mode),
              valid_from = $5,
              valid_until = $6,
              source_type = COALESCE($7, source_type),
              source_reference = COALESCE($8, source_reference),
              notes = COALESCE($9, notes),
              updated_at = now(),
              version = version + 1
            WHERE organization_id = $1 AND environment_id = $2 AND id = $3
              AND version = $10 AND deleted_at IS NULL
            `,
            [
              context.organizationId,
              environmentId,
              strategyId,
              input.mode ?? null,
              validFrom,
              validUntil,
              input.sourceType ?? null,
              input.sourceReference ?? null,
              input.notes ?? null,
              input.version,
            ],
          );
          if (updated.rowCount !== 1) {
            throw new ConflictException('VERSION_CONFLICT');
          }
          if (input.items) {
            await this.replaceItems(client, context.organizationId, strategyId, input.items);
          }
        },
      );
      this.logger.info(
        { organizationId: context.organizationId, environmentId, strategyId },
        'tax_strategy.updated',
      );
      return await this.get(context, environmentId, strategyId);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async validate(
    context: OrganizationRequestContext,
    environmentId: string,
    strategyId: string,
  ): Promise<TaxStrategyValidationResult> {
    const strategy = await this.get(context, environmentId, strategyId);
    const activeDomains = await this.activeTaxDomains(context);
    return this.validation.validate(strategy.mode, strategy.items, activeDomains, {
      requireComplete: true,
    });
  }

  async submitReview(
    context: OrganizationRequestContext,
    environmentId: string,
    strategyId: string,
  ): Promise<TaxStrategyView> {
    const result = await this.validate(context, environmentId, strategyId);
    if (!result.valid) {
      throw new UnprocessableEntityException('TAX_STRATEGY_INCOMPLETE');
    }
    await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        const current = await this.requireStrategy(
          client,
          context.organizationId,
          environmentId,
          strategyId,
        );
        if (current.status === 'CONFIRMED') {
          throw new ConflictException('TAX_STRATEGY_ALREADY_CONFIRMED');
        }
        await client.query(
          `
          UPDATE app.environment_tax_strategies
          SET status = 'PENDING_REVIEW', updated_at = now(), version = version + 1
          WHERE organization_id = $1 AND environment_id = $2 AND id = $3 AND deleted_at IS NULL
          `,
          [context.organizationId, environmentId, strategyId],
        );
      },
    );
    this.logger.info(
      { organizationId: context.organizationId, environmentId, strategyId },
      'tax_strategy.submitted',
    );
    return await this.get(context, environmentId, strategyId);
  }

  async confirm(
    context: OrganizationRequestContext,
    environmentId: string,
    strategyId: string,
  ): Promise<TaxStrategyView> {
    try {
      await this.repository.withTenantTransaction(
        { organizationId: context.organizationId, userId: context.user.userId },
        async (client) => {
          const strategy = await this.requireStrategyForUpdate(
            client,
            context.organizationId,
            environmentId,
            strategyId,
          );
          if (strategy.status === 'CONFIRMED') {
            throw new ConflictException('TAX_STRATEGY_ALREADY_CONFIRMED');
          }
          if (strategy.source_type === 'SYSTEM_SUGGESTION') {
            throw new UnprocessableEntityException('TAX_STRATEGY_INCOMPLETE');
          }
          const items = await this.loadItems(client, context.organizationId, strategyId);
          const activeDomains = await this.activeTaxDomainsInTransaction(client);
          const validation = this.validation.validate(
            strategy.mode as never,
            items,
            activeDomains,
            {
              requireComplete: true,
            },
          );
          if (!validation.valid) {
            const modeMismatch = validation.errors.some(
              (error) => error.code === 'TAX_STRATEGY_MODE_MISMATCH',
            );
            throw new UnprocessableEntityException(
              modeMismatch ? 'TAX_STRATEGY_MODE_MISMATCH' : 'TAX_STRATEGY_INCOMPLETE',
            );
          }
          await this.requireFiscalProfileCoverage(client, context.organizationId, strategy);
          await client.query(
            `
            UPDATE app.environment_tax_strategies
            SET status = 'CONFIRMED',
              confirmed_by_user_id = $4,
              confirmed_at = now(),
              updated_at = now(),
              version = version + 1
            WHERE organization_id = $1 AND environment_id = $2 AND id = $3 AND deleted_at IS NULL
            `,
            [context.organizationId, environmentId, strategyId, context.user.userId],
          );
        },
      );
      this.logger.info(
        { organizationId: context.organizationId, environmentId, strategyId },
        'tax_strategy.confirmed',
      );
      return await this.get(context, environmentId, strategyId);
    } catch (error) {
      this.mapDatabaseError(error);
    }
  }

  async deactivate(
    context: OrganizationRequestContext,
    environmentId: string,
    strategyId: string,
  ): Promise<void> {
    await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        const updated = await client.query(
          `
          UPDATE app.environment_tax_strategies
          SET status = 'DEACTIVATED', deleted_at = now(), updated_at = now(), version = version + 1
          WHERE organization_id = $1 AND environment_id = $2 AND id = $3 AND deleted_at IS NULL
          `,
          [context.organizationId, environmentId, strategyId],
        );
        if (updated.rowCount !== 1) {
          throw new NotFoundException('TAX_STRATEGY_NOT_FOUND');
        }
      },
    );
    this.logger.info(
      { organizationId: context.organizationId, environmentId, strategyId },
      'tax_strategy.deactivated',
    );
  }

  private async attachItems(
    context: OrganizationRequestContext,
    rows: StrategyRow[],
  ): Promise<TaxStrategyView[]> {
    if (rows.length === 0) {
      return [];
    }
    const strategyIds = rows.map((row) => row.id);
    const items = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        const result = await client.query<StrategyItemRow>(
          `
          SELECT id, strategy_id, tax_domain_code, owner_code, not_applicable_reason, notes, version
          FROM app.environment_tax_strategy_items
          WHERE organization_id = $1 AND strategy_id = ANY($2::uuid[])
          ORDER BY tax_domain_code ASC
          `,
          [context.organizationId, strategyIds],
        );
        return result.rows;
      },
    );
    return rows.map((row) =>
      this.toView(
        row,
        items.filter((item) => item.strategy_id === row.id),
      ),
    );
  }

  private async requireEnvironment(
    client: PoolClient,
    organizationId: string,
    environmentId: string,
  ): Promise<{ branch_id: string }> {
    const result = await client.query<{ branch_id: string }>(
      `
      SELECT branch_id
      FROM app.protheus_environments
      WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL
      LIMIT 1
      `,
      [organizationId, environmentId],
    );
    if (result.rowCount !== 1) {
      throw new NotFoundException('ENVIRONMENT_NOT_FOUND');
    }
    return result.rows[0];
  }

  private async requireStrategy(
    client: PoolClient,
    organizationId: string,
    environmentId: string,
    strategyId: string,
  ): Promise<StrategyRow> {
    const result = await client.query<StrategyRow>(
      `
      SELECT id, organization_id, environment_id, branch_id, mode, status, valid_from::text,
        valid_until::text, source_type, source_reference, notes, confirmed_at::text, version
      FROM app.environment_tax_strategies
      WHERE organization_id = $1 AND environment_id = $2 AND id = $3 AND deleted_at IS NULL
      LIMIT 1
      `,
      [organizationId, environmentId, strategyId],
    );
    if (result.rowCount !== 1) {
      throw new NotFoundException('TAX_STRATEGY_NOT_FOUND');
    }
    return result.rows[0];
  }

  private async requireStrategyForUpdate(
    client: PoolClient,
    organizationId: string,
    environmentId: string,
    strategyId: string,
  ): Promise<StrategyRow> {
    const result = await client.query<StrategyRow>(
      `
      SELECT id, organization_id, environment_id, branch_id, mode, status, valid_from::text,
        valid_until::text, source_type, source_reference, notes, confirmed_at::text, version
      FROM app.environment_tax_strategies
      WHERE organization_id = $1 AND environment_id = $2 AND id = $3 AND deleted_at IS NULL
      FOR UPDATE
      `,
      [organizationId, environmentId, strategyId],
    );
    if (result.rowCount !== 1) {
      throw new NotFoundException('TAX_STRATEGY_NOT_FOUND');
    }
    return result.rows[0];
  }

  private async validateInputItems(
    client: PoolClient,
    items: TaxStrategyItemInput[],
  ): Promise<void> {
    const domains = await this.activeTaxDomainsInTransaction(client);
    const result = this.validation.validate('LEGACY', items, domains, { requireComplete: false });
    const hardError = result.errors.find((error) =>
      [
        'TAX_DOMAIN_DUPLICATED',
        'TAX_DOMAIN_NOT_FOUND',
        'NOT_APPLICABLE_REASON_REQUIRED',
        'TAX_OWNER_INVALID',
      ].includes(error.code),
    );
    if (hardError) {
      throw new UnprocessableEntityException(hardError.code);
    }
  }

  private async replaceItems(
    client: PoolClient,
    organizationId: string,
    strategyId: string,
    items: TaxStrategyItemInput[],
  ): Promise<void> {
    await client.query(
      'DELETE FROM app.environment_tax_strategy_items WHERE organization_id = $1 AND strategy_id = $2',
      [organizationId, strategyId],
    );
    for (const item of items) {
      await client.query(
        `
        INSERT INTO app.environment_tax_strategy_items (
          id, organization_id, strategy_id, tax_domain_code, owner_code, not_applicable_reason, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          randomUUID(),
          organizationId,
          strategyId,
          item.taxDomainCode,
          item.ownerCode,
          item.notApplicableReason ?? null,
          item.notes ?? null,
        ],
      );
    }
  }

  private async loadItems(
    client: PoolClient,
    organizationId: string,
    strategyId: string,
  ): Promise<TaxStrategyItemInput[]> {
    const result = await client.query<StrategyItemRow>(
      `
      SELECT id, strategy_id, tax_domain_code, owner_code, not_applicable_reason, notes, version
      FROM app.environment_tax_strategy_items
      WHERE organization_id = $1 AND strategy_id = $2
      `,
      [organizationId, strategyId],
    );
    return result.rows.map((row) => ({
      taxDomainCode: row.tax_domain_code as TaxDomainCode,
      ownerCode: row.owner_code as never,
      notApplicableReason: row.not_applicable_reason,
      notes: row.notes,
    }));
  }

  private async activeTaxDomains(context: OrganizationRequestContext): Promise<TaxDomainCode[]> {
    return await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => await this.activeTaxDomainsInTransaction(client),
    );
  }

  private async activeTaxDomainsInTransaction(client: PoolClient): Promise<TaxDomainCode[]> {
    const result = await client.query<{ code: TaxDomainCode }>(
      'SELECT code FROM app.tax_domains WHERE active = true ORDER BY display_order ASC',
    );
    return result.rows.map((row) => row.code);
  }

  private async requireFiscalProfileCoverage(
    client: PoolClient,
    organizationId: string,
    strategy: StrategyRow,
  ): Promise<void> {
    const result = await client.query(
      `
      SELECT 1
      FROM app.branch_fiscal_profiles
      WHERE organization_id = $1
        AND branch_id = $2
        AND status = 'CONFIRMED'
        AND deleted_at IS NULL
        AND valid_from <= $3::date
        AND (valid_until IS NULL OR valid_until >= $3::date)
      LIMIT 1
      `,
      [organizationId, strategy.branch_id, strategy.valid_from],
    );
    if (result.rowCount !== 1) {
      throw new UnprocessableEntityException('CONFIRMED_FISCAL_PROFILE_REQUIRED');
    }
  }

  private validatePeriod(validFrom: string, validUntil: string | null | undefined): void {
    if (validUntil && validUntil < validFrom) {
      throw new UnprocessableEntityException('TAX_STRATEGY_INVALID_PERIOD');
    }
  }

  private toView(row: StrategyRow, items: StrategyItemRow[]): TaxStrategyView {
    return {
      id: row.id,
      organizationId: row.organization_id,
      environmentId: row.environment_id,
      branchId: row.branch_id,
      mode: row.mode as never,
      status: row.status as never,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      sourceType: row.source_type as never,
      sourceReference: row.source_reference,
      notes: row.notes,
      confirmedAt: row.confirmed_at,
      version: row.version,
      items: items.map((item) => ({
        id: item.id,
        taxDomainCode: item.tax_domain_code as TaxDomainCode,
        ownerCode: item.owner_code as never,
        notApplicableReason: item.not_applicable_reason,
        notes: item.notes,
        version: item.version,
      })),
    };
  }

  private mapDatabaseError(error: unknown): never {
    if (error instanceof Error && error.message.includes('TAX_STRATEGY_OVERLAP')) {
      throw new ConflictException('TAX_STRATEGY_OVERLAP');
    }
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw new ConflictException('TAX_DOMAIN_DUPLICATED');
    }
    throw error;
  }
}
