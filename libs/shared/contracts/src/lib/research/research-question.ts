import type { ResearchDomain, ResearchRecordStatus } from './research-enums';

export interface ResearchQuestionRecord {
  id: string;
  question: string;
  domains: ResearchDomain[];
  askedBy: string;
  askedAt: string;
  status: ResearchRecordStatus;
  requiredAuthority: string[];
  acceptedSourceIds: string[];
  notes?: string;
}
