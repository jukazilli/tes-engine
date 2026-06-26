import {
  TAX_OWNER_CODES,
  TAX_STRATEGY_MODE_OPTIONS,
  TAX_STRATEGY_MODES,
  TAX_STRATEGY_SOURCE_TYPES,
  TaxStrategyValidationService,
} from '@tes-engine/backend/tax-strategy';

describe('tax-strategies', () => {
  it('controls modes, owners and source types as stable codes', () => {
    expect(TAX_STRATEGY_MODES).toEqual(['LEGACY', 'HYBRID', 'FULL_CONFIGTRIB']);
    expect(TAX_OWNER_CODES).toEqual(['LEGACY_TES', 'CONFIGTRIB', 'NOT_APPLICABLE']);
    expect(TAX_STRATEGY_SOURCE_TYPES).toContain('SYSTEM_SUGGESTION');
    expect(TAX_STRATEGY_MODE_OPTIONS.every((option) => option.active)).toBe(true);
  });

  it('keeps the one behavior to one tax ownership rule per active tax domain', () => {
    const service = new TaxStrategyValidationService();
    const result = service.validate(
      'HYBRID',
      [
        { taxDomainCode: 'ICMS', ownerCode: 'CONFIGTRIB' },
        { taxDomainCode: 'IPI', ownerCode: 'LEGACY_TES' },
      ],
      ['ICMS', 'IPI'],
      { requireComplete: true },
    );
    expect(result.valid).toBe(true);
  });
});
