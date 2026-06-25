export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface OrganizationPublic {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  version: number;
}
