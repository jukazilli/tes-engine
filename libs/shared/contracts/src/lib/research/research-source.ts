import type {
  ResearchDomain,
  ResearchRecordStatus,
  SourceAuthorityLevel,
  SourceKind,
} from './research-enums';

export interface ResearchSourceRecord {
  id: string;
  title: string;
  kind: SourceKind;
  authorityLevel: SourceAuthorityLevel;
  domains: ResearchDomain[];
  url?: string;
  publisher: string;
  version?: string;
  accessedAt: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  status: ResearchRecordStatus;
  copyrightPolicy: 'SUMMARY_ONLY' | 'SHORT_EXCERPTS_ALLOWED' | 'INTERNAL_REFERENCE_ONLY';
  notes?: string;
}
