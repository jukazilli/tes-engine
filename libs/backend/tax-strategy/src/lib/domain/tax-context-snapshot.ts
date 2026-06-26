import { TaxDomainCode } from './tax-domain';
import { TaxOwnerCode } from './tax-owner';
import { TaxStrategyMode } from './tax-strategy-mode';

export const TAX_CONTEXT_BLOCKERS = [
  'MISSING_CONFIRMED_FISCAL_PROFILE',
  'MISSING_CONFIRMED_TAX_STRATEGY',
  'TAX_STRATEGY_INCOMPLETE',
  'TAX_STRATEGY_MODE_MISMATCH',
  'TAX_STRATEGY_OVERLAP',
  'MISSING_SF4_SNAPSHOT',
  'MISSING_CONFIGTRIB_COVERAGE',
] as const;

export type TaxContextBlockerCode = (typeof TAX_CONTEXT_BLOCKERS)[number];
export type TaxContextWarningCode = 'FISCAL_PROFILE_DOES_NOT_COVER_STRATEGY_PERIOD';

export interface TaxContextIssue {
  code: string;
  message: string;
}

export type TaxContextBlocker = TaxContextIssue & { code: TaxContextBlockerCode };
export type TaxContextWarning = TaxContextIssue & { code: TaxContextWarningCode };

export interface TaxContextSnapshot {
  organizationId: string;
  environmentId: string;
  branchId: string;
  referenceDate: string;
  fiscalProfile: {
    profileId: string;
    taxRegimeCode: string;
    nfeCrtCode: string;
    icmsTaxpayerIndicator: string;
    validFrom: string;
    validUntil?: string;
    version: number;
  } | null;
  strategy: {
    strategyId: string;
    mode: TaxStrategyMode;
    validFrom: string;
    validUntil?: string;
    version: number;
    confirmedAt: string;
  } | null;
  taxOwnership: Partial<Record<TaxDomainCode, TaxOwnerCode>>;
  readiness: {
    strategyReady: boolean;
    executionReady: false;
    blockers: TaxContextBlocker[];
    warnings: TaxContextWarning[];
  };
}
