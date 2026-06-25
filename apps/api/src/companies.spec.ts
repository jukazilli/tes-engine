import { TAX_REGIME_CODES, isValidCnpj } from '@tes-engine/backend/companies';

describe('companies', () => {
  it('uses controlled tax regime codes and validates CNPJ roots indirectly', () => {
    expect(TAX_REGIME_CODES).toContain('LUCRO_REAL');
    expect(TAX_REGIME_CODES).not.toContain('Lucro Real');
    expect(isValidCnpj('12.345.678/0001-95')).toBe(true);
  });
});
