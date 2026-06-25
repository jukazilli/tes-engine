export const SYSTEM_ROLE_CODES = [
  'ADMIN',
  'CONSULTANT',
  'TAX_ANALYST',
  'APPROVER',
  'VIEWER',
] as const;

export type SystemRoleCode = (typeof SYSTEM_ROLE_CODES)[number];
