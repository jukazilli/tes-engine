export const ORGANIZATION_PERMISSIONS = [
  'organization:read',
  'organization:update',
  'organization:deactivate',
  'membership:read',
  'membership:invite',
  'membership:update',
  'membership:remove',
  'invitation:read',
  'invitation:create',
  'invitation:resend',
  'invitation:revoke',
  'role:read',
  'role:assign',
] as const;

export type OrganizationPermission = (typeof ORGANIZATION_PERMISSIONS)[number];
