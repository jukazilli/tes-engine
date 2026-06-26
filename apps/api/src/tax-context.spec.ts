import { TAX_CONTEXT_BLOCKERS } from '@tes-engine/backend/tax-strategy';

describe('tax-context', () => {
  it('separates strategy readiness from execution readiness blockers', () => {
    expect(TAX_CONTEXT_BLOCKERS).toEqual(
      expect.arrayContaining(['MISSING_SF4_SNAPSHOT', 'MISSING_CONFIGTRIB_COVERAGE']),
    );
  });
});
