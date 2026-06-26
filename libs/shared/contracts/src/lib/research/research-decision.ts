import type { ResearchDecisionStatus } from './research-enums';

export interface ResearchDecisionRecord {
  id: string;
  title: string;
  status: ResearchDecisionStatus;
  decidedBy: string;
  decidedAt: string;
  acceptedClaimIds: string[];
  rejectedClaimIds?: string[];
  conflictIds?: string[];
  consequences: string[];
}
