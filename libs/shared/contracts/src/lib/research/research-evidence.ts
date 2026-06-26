import type { EvidenceKind, ResearchRecordStatus } from './research-enums';

export interface ResearchEvidenceRecord {
  id: string;
  sourceId: string;
  questionId: string;
  kind: EvidenceKind;
  locator: string;
  observedAt: string;
  summary: string;
  status: ResearchRecordStatus;
  limitations?: string[];
}
