export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface InvitationPublic {
  id: string;
  invitedEmail: string;
  status: InvitationStatus;
  roleCode: string;
  roleName: string;
  createdAt: string;
  lastSentAt: string;
  expiresAt: string;
  resendCount: number;
  version: number;
}
