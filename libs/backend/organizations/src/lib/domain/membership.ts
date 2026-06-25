export type MembershipStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

export interface MembershipPublic {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  status: MembershipStatus;
  roles: string[];
  joinedAt?: string;
  createdAt: string;
  version: number;
}
