export const TAX_STRATEGY_MODES = ['LEGACY', 'HYBRID', 'FULL_CONFIGTRIB'] as const;
export type TaxStrategyMode = (typeof TAX_STRATEGY_MODES)[number];

export function isTaxStrategyMode(value: string): value is TaxStrategyMode {
  return TAX_STRATEGY_MODES.includes(value as TaxStrategyMode);
}
