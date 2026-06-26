import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantSqlRepository } from '@tes-engine/backend/companies';
import { OrganizationRequestContext } from '@tes-engine/backend/organizations';
import { PinoLogger } from 'nestjs-pino';
import { TaxContextBlocker, TaxContextSnapshot } from '../domain/tax-context-snapshot';
import { TaxDomainCode } from '../domain/tax-domain';
import { TaxOwnerCode } from '../domain/tax-owner';
import { TaxStrategyMode } from '../domain/tax-strategy-mode';

interface EnvironmentRow {
  branch_id: string;
}

interface FiscalProfileRow {
  id: string;
  tax_regime_code: string;
  nfe_crt_code: string;
  icms_taxpayer_indicator: string;
  valid_from: string;
  valid_until: string | null;
  version: number;
}

interface StrategyRow {
  id: string;
  mode: TaxStrategyMode;
  valid_from: string;
  valid_until: string | null;
  version: number;
  confirmed_at: string;
}

interface OwnershipRow {
  tax_domain_code: TaxDomainCode;
  owner_code: TaxOwnerCode;
}

@Injectable()
export class TaxContextResolverService {
  constructor(
    private readonly repository: TenantSqlRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TaxContextResolverService.name);
  }

  async atDate(
    context: OrganizationRequestContext,
    environmentId: string,
    referenceDate: string,
  ): Promise<TaxContextSnapshot> {
    const snapshot = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        const environment = await client.query<EnvironmentRow>(
          `
          SELECT branch_id
          FROM app.protheus_environments
          WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL
          LIMIT 1
          `,
          [context.organizationId, environmentId],
        );
        if (environment.rowCount !== 1) {
          throw new NotFoundException('ENVIRONMENT_NOT_FOUND');
        }
        const branchId = environment.rows[0].branch_id;
        const fiscalProfile = await client.query<FiscalProfileRow>(
          `
          SELECT id, tax_regime_code, nfe_crt_code, icms_taxpayer_indicator,
            valid_from::text, valid_until::text, version
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
          [context.organizationId, branchId, referenceDate],
        );
        const strategy = await client.query<StrategyRow>(
          `
          SELECT id, mode, valid_from::text, valid_until::text, version, confirmed_at::text
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
          [context.organizationId, environmentId, referenceDate],
        );

        const blockers: TaxContextBlocker[] = [];
        if (fiscalProfile.rowCount !== 1) {
          blockers.push({
            code: 'MISSING_CONFIRMED_FISCAL_PROFILE',
            message: 'No confirmed fiscal profile is effective for the reference date.',
          });
        }
        if (strategy.rowCount !== 1) {
          blockers.push({
            code: 'MISSING_CONFIRMED_TAX_STRATEGY',
            message: 'No confirmed tax strategy is effective for the reference date.',
          });
        }

        const ownership: Partial<Record<TaxDomainCode, TaxOwnerCode>> = {};
        if (strategy.rowCount === 1) {
          const rows = await client.query<OwnershipRow>(
            `
            SELECT tax_domain_code, owner_code
            FROM app.environment_tax_strategy_items
            WHERE organization_id = $1 AND strategy_id = $2
            ORDER BY tax_domain_code ASC
            `,
            [context.organizationId, strategy.rows[0].id],
          );
          for (const row of rows.rows) {
            ownership[row.tax_domain_code] = row.owner_code;
          }
          this.appendExecutionBlockers(strategy.rows[0].mode, blockers);
        }

        const strategyReady =
          fiscalProfile.rowCount === 1 &&
          strategy.rowCount === 1 &&
          !blockers.some((blocker) =>
            [
              'MISSING_CONFIRMED_FISCAL_PROFILE',
              'MISSING_CONFIRMED_TAX_STRATEGY',
              'TAX_STRATEGY_INCOMPLETE',
              'TAX_STRATEGY_MODE_MISMATCH',
              'TAX_STRATEGY_OVERLAP',
            ].includes(blocker.code),
          );

        return {
          organizationId: context.organizationId,
          environmentId,
          branchId,
          referenceDate,
          fiscalProfile:
            fiscalProfile.rowCount === 1
              ? {
                  profileId: fiscalProfile.rows[0].id,
                  taxRegimeCode: fiscalProfile.rows[0].tax_regime_code,
                  nfeCrtCode: fiscalProfile.rows[0].nfe_crt_code,
                  icmsTaxpayerIndicator: fiscalProfile.rows[0].icms_taxpayer_indicator,
                  validFrom: fiscalProfile.rows[0].valid_from,
                  validUntil: fiscalProfile.rows[0].valid_until ?? undefined,
                  version: fiscalProfile.rows[0].version,
                }
              : null,
          strategy:
            strategy.rowCount === 1
              ? {
                  strategyId: strategy.rows[0].id,
                  mode: strategy.rows[0].mode,
                  validFrom: strategy.rows[0].valid_from,
                  validUntil: strategy.rows[0].valid_until ?? undefined,
                  version: strategy.rows[0].version,
                  confirmedAt: strategy.rows[0].confirmed_at,
                }
              : null,
          taxOwnership: ownership,
          readiness: {
            strategyReady,
            executionReady: false as const,
            blockers,
            warnings: [],
          },
        };
      },
    );

    this.logger.info(
      {
        organizationId: context.organizationId,
        environmentId,
        referenceDate,
        blocked: snapshot.readiness.blockers.length > 0,
      },
      snapshot.readiness.blockers.length > 0 ? 'tax_context.blocked' : 'tax_context.resolved',
    );
    return snapshot;
  }

  private appendExecutionBlockers(mode: TaxStrategyMode, blockers: TaxContextBlocker[]): void {
    if (mode === 'LEGACY' || mode === 'HYBRID') {
      blockers.push({
        code: 'MISSING_SF4_SNAPSHOT',
        message: 'SF4 snapshot is required before tax execution can be ready.',
      });
    }
    if (mode === 'FULL_CONFIGTRIB' || mode === 'HYBRID') {
      blockers.push({
        code: 'MISSING_CONFIGTRIB_COVERAGE',
        message: 'ConfigTrib coverage is required before tax execution can be ready.',
      });
    }
  }
}
