import {
  isValidProtheusCode,
  isValidProtheusVersion,
  normalizeProtheusCode,
} from './protheus-environment.validation';

describe('protheus environment validation', () => {
  it('preserves zeros while normalizing codes', () => {
    expect(normalizeProtheusCode(' 01 ')).toBe('01');
    expect(isValidProtheusCode('01')).toBe(true);
  });

  it('keeps versions as text with a bounded dotted format', () => {
    expect(isValidProtheusVersion('12.1.2510')).toBe(true);
    expect(isValidProtheusVersion('25.10')).toBe(true);
    expect(isValidProtheusVersion('12.x')).toBe(false);
  });
});
