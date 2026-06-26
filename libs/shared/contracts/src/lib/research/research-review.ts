export interface ResearchReviewRecord {
  id: string;
  targetId: string;
  reviewer: string;
  reviewedAt: string;
  result: 'APPROVED' | 'APPROVED_WITH_LIMITATIONS' | 'REJECTED';
  notes?: string;
}
