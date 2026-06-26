export const TAX_DOMAIN_CODES = [
  'ICMS',
  'ICMS_ST',
  'IPI',
  'PIS',
  'COFINS',
  'ISS',
  'DIFAL',
  'FCP',
] as const;

export type TaxDomainCode = (typeof TAX_DOMAIN_CODES)[number];
