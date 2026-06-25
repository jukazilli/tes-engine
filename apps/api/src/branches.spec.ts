import {
  ESTABLISHMENT_TYPES,
  isValidMunicipalityCode,
  isValidPostalCode,
} from '@tes-engine/backend/companies';

describe('branches', () => {
  it('uses controlled establishment types and Brazilian address validators', () => {
    expect(ESTABLISHMENT_TYPES).toEqual(['MATRIZ', 'FILIAL', 'OUTRO']);
    expect(isValidPostalCode('89200000')).toBe(true);
    expect(isValidMunicipalityCode('4209102')).toBe(true);
  });
});
