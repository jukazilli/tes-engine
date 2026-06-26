import { TaxStrategyValidationService } from '@tes-engine/backend/tax-strategy';

describe('tax-strategy-readiness', () => {
  const service = new TaxStrategyValidationService();

  it('rejects incomplete strategies before confirmation', () => {
    const result = service.validate(
      'LEGACY',
      [{ taxDomainCode: 'ICMS', ownerCode: 'LEGACY_TES' }],
      ['ICMS', 'IPI'],
      { requireComplete: true },
    );
    expect(result.errors.some((error) => error.code === 'TAX_STRATEGY_INCOMPLETE')).toBe(true);
  });

  it('keeps draft validation able to be incomplete', () => {
    const result = service.validate(
      'LEGACY',
      [{ taxDomainCode: 'ICMS', ownerCode: 'LEGACY_TES' }],
      ['ICMS', 'IPI'],
      { requireComplete: false },
    );
    expect(result.valid).toBe(true);
  });
});
