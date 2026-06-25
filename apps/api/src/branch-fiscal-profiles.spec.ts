import {
  FISCAL_SOURCE_TYPES,
  ICMS_TAXPAYER_INDICATORS,
  NFE_CRT_CODES,
  TAX_REGIME_CODES,
} from '@tes-engine/backend/companies';

describe('branch-fiscal-profiles', () => {
  it('separates tax regime, NF-e CRT, ICMS taxpayer indicator and source', () => {
    expect(TAX_REGIME_CODES).toContain('LUCRO_REAL');
    expect(NFE_CRT_CODES).toContain('3');
    expect(ICMS_TAXPAYER_INDICATORS).toContain('NAO_CONTRIBUINTE');
    expect(FISCAL_SOURCE_TYPES).toContain('PROTHEUS_PARAMETER');
  });
});
