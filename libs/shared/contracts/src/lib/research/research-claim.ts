import type { ClaimScopeKind, ResearchDomain, ResearchRecordStatus } from './research-enums';

export interface ResearchClaimScope {
  kind: ClaimScopeKind;
  country?: string;
  state?: string;
  release?: string;
  tenantEnvironmentId?: string;
}

export interface ResearchClaimRecord {
  id: string;
  statement: string;
  domains: ResearchDomain[];
  scope: ResearchClaimScope;
  sourceIds: string[];
  evidenceIds: string[];
  status: ResearchRecordStatus;
  effectiveFrom?: string;
  effectiveUntil?: string;
  limitations?: string[];
  reviewer?: string;
  reviewedAt?: string;
  supersedes?: string[];
}
