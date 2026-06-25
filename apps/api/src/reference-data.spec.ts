import {
  ICMS_TAXPAYER_OPTIONS,
  NFE_CRT_OPTIONS,
  TAX_REGIME_OPTIONS,
} from '@tes-engine/backend/companies';

describe('reference-data', () => {
  it('returns code and label without persisting labels as codes', () => {
    expect(TAX_REGIME_OPTIONS[0]).toHaveProperty('code');
    expect(TAX_REGIME_OPTIONS[0]).toHaveProperty('label');
    expect(NFE_CRT_OPTIONS.some((option) => option.code === '2')).toBe(true);
    expect(ICMS_TAXPAYER_OPTIONS.some((option) => option.metadata?.['indIEDest'] === 9)).toBe(true);
  });
});
