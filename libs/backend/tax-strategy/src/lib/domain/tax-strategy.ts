import { TaxDomainCode } from './tax-domain';
import { TaxOwnerCode } from './tax-owner';
import { TaxStrategyMode } from './tax-strategy-mode';

export const TAX_STRATEGY_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'CONFIRMED',
  'SUPERSEDED',
  'DEACTIVATED',
] as const;

export const TAX_STRATEGY_SOURCE_TYPES = [
  'MANUAL',
  'IMPORTED_CONFIGURATION',
  'FISCAL_REVIEW',
  'SYSTEM_SUGGESTION',
] as const;

export type TaxStrategyStatus = (typeof TAX_STRATEGY_STATUSES)[number];
export type TaxStrategySourceType = (typeof TAX_STRATEGY_SOURCE_TYPES)[number];

export interface TaxStrategyItemInput {
  taxDomainCode: TaxDomainCode;
  ownerCode: TaxOwnerCode;
  notApplicableReason?: string | null;
  notes?: string | null;
}

export interface TaxStrategyInput {
  mode: TaxStrategyMode;
  validFrom: string;
  validUntil?: string | null;
  sourceType: TaxStrategySourceType;
  sourceReference?: string | null;
  notes?: string | null;
  items?: TaxStrategyItemInput[];
}

export interface TaxStrategyView {
  id: string;
  organizationId: string;
  environmentId: string;
  branchId: string;
  mode: TaxStrategyMode;
  status: TaxStrategyStatus;
  validFrom: string;
  validUntil: string | null;
  sourceType: TaxStrategySourceType;
  sourceReference: string | null;
  notes: string | null;
  confirmedAt: string | null;
  version: number;
  items: TaxStrategyItemView[];
}

export interface TaxStrategyItemView {
  id: string;
  taxDomainCode: TaxDomainCode;
  ownerCode: TaxOwnerCode;
  notApplicableReason: string | null;
  notes: string | null;
  version: number;
}
