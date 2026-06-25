export const PROTHEUS_ENVIRONMENT_TYPES = [
  'DEVELOPMENT',
  'HOMOLOGATION',
  'PRODUCTION',
  'OTHER',
] as const;

export const PROTHEUS_ENVIRONMENT_STATUSES = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'] as const;

export function normalizeProtheusCode(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidProtheusCode(value: string): boolean {
  return /^[A-Z0-9_.-]{1,20}$/.test(value);
}

export function isValidProtheusVersion(value: string): boolean {
  return /^\d{1,2}(?:\.\d{1,4}){0,3}$/.test(value) && value.length <= 20;
}
