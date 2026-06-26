import type { ConflictResolutionStatus } from './research-enums';

export interface ResearchConflictRecord {
  id: string;
  claimIds: string[];
  summary: string;
  resolutionStatus: ConflictResolutionStatus;
  resolution: string;
  decidedBy?: string;
  decidedAt?: string;
}
