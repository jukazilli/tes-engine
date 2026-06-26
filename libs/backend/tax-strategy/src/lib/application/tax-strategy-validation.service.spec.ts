import { TaxStrategyValidationService } from './tax-strategy-validation.service';

const activeDomains = ['ICMS', 'IPI', 'PIS'] as const;

describe('TaxStrategyValidationService', () => {
  const service = new TaxStrategyValidationService();

  it('accepts a complete LEGACY strategy', () => {
    const result = service.validate(
      'LEGACY',
      activeDomains.map((taxDomainCode) => ({ taxDomainCode, ownerCode: 'LEGACY_TES' })),
      [...activeDomains],
      { requireComplete: true },
    );
    expect(result.valid).toBe(true);
  });

  it('rejects LEGACY with ConfigTrib owner', () => {
    const result = service.validate(
      'LEGACY',
      [
        { taxDomainCode: 'ICMS', ownerCode: 'LEGACY_TES' },
        { taxDomainCode: 'IPI', ownerCode: 'CONFIGTRIB' },
        { taxDomainCode: 'PIS', ownerCode: 'LEGACY_TES' },
      ],
      [...activeDomains],
      { requireComplete: true },
    );
    expect(result.errors.some((error) => error.code === 'TAX_STRATEGY_MODE_MISMATCH')).toBe(true);
  });

  it('accepts a complete FULL_CONFIGTRIB strategy', () => {
    const result = service.validate(
      'FULL_CONFIGTRIB',
      activeDomains.map((taxDomainCode) => ({ taxDomainCode, ownerCode: 'CONFIGTRIB' })),
      [...activeDomains],
      { requireComplete: true },
    );
    expect(result.valid).toBe(true);
  });

  it('rejects FULL_CONFIGTRIB with legacy owner', () => {
    const result = service.validate(
      'FULL_CONFIGTRIB',
      [
        { taxDomainCode: 'ICMS', ownerCode: 'CONFIGTRIB' },
        { taxDomainCode: 'IPI', ownerCode: 'LEGACY_TES' },
        { taxDomainCode: 'PIS', ownerCode: 'CONFIGTRIB' },
      ],
      [...activeDomains],
      { requireComplete: true },
    );
    expect(result.errors.some((error) => error.code === 'TAX_STRATEGY_MODE_MISMATCH')).toBe(true);
  });

  it('accepts HYBRID with real mixed ownership', () => {
    const result = service.validate(
      'HYBRID',
      [
        { taxDomainCode: 'ICMS', ownerCode: 'CONFIGTRIB' },
        { taxDomainCode: 'IPI', ownerCode: 'LEGACY_TES' },
        { taxDomainCode: 'PIS', ownerCode: 'NOT_APPLICABLE', notApplicableReason: 'Sem operacao' },
      ],
      [...activeDomains],
      { requireComplete: true },
    );
    expect(result.valid).toBe(true);
  });

  it('rejects HYBRID without real mixed ownership', () => {
    const result = service.validate(
      'HYBRID',
      activeDomains.map((taxDomainCode) => ({ taxDomainCode, ownerCode: 'CONFIGTRIB' })),
      [...activeDomains],
      { requireComplete: true },
    );
    expect(result.errors.some((error) => error.code === 'TAX_STRATEGY_MODE_MISMATCH')).toBe(true);
  });

  it('rejects duplicated or missing tax domains and not applicable without reason', () => {
    const result = service.validate(
      'LEGACY',
      [
        { taxDomainCode: 'ICMS', ownerCode: 'LEGACY_TES' },
        { taxDomainCode: 'ICMS', ownerCode: 'LEGACY_TES' },
        { taxDomainCode: 'IPI', ownerCode: 'NOT_APPLICABLE' },
      ],
      [...activeDomains],
      { requireComplete: true },
    );
    expect(result.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining([
        'TAX_DOMAIN_DUPLICATED',
        'TAX_STRATEGY_INCOMPLETE',
        'NOT_APPLICABLE_REASON_REQUIRED',
      ]),
    );
  });
});
