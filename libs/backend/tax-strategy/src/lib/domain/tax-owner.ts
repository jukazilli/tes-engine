export const TAX_OWNER_CODES = ['LEGACY_TES', 'CONFIGTRIB', 'NOT_APPLICABLE'] as const;
export type TaxOwnerCode = (typeof TAX_OWNER_CODES)[number];

export function isTaxOwnerCode(value: string): value is TaxOwnerCode {
  return TAX_OWNER_CODES.includes(value as TaxOwnerCode);
}
