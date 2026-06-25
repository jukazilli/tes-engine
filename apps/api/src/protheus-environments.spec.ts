import {
  isValidProtheusCode,
  isValidProtheusVersion,
  normalizeProtheusCode,
} from '@tes-engine/backend/protheus-environments';

describe('protheus-environments', () => {
  it('keeps Protheus codes and releases as bounded strings', () => {
    expect(normalizeProtheusCode(' 01 ')).toBe('01');
    expect(isValidProtheusCode('01')).toBe(true);
    expect(isValidProtheusVersion('12.1.2510')).toBe(true);
  });
});
