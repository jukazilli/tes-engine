import { isValidCnpj, isValidMunicipalityCode, isValidPostalCode } from './cnpj.validator';

describe('cnpj validator', () => {
  it('validates CNPJ check digits and accepts punctuation', () => {
    expect(isValidCnpj('12.345.678/0001-95')).toBe(true);
    expect(isValidCnpj('12.345.678/0001-90')).toBe(false);
  });

  it('rejects invalid postal and municipality codes', () => {
    expect(isValidPostalCode('89200000')).toBe(true);
    expect(isValidPostalCode('89200-000')).toBe(true);
    expect(isValidMunicipalityCode('4209102')).toBe(true);
    expect(isValidMunicipalityCode('42091')).toBe(false);
  });
});
