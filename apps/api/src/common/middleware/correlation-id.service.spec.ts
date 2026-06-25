import { randomUUID } from 'node:crypto';
import { CorrelationIdService } from './correlation-id.service';

describe('CorrelationIdService', () => {
  const service = new CorrelationIdService();

  it('reuses valid correlation IDs', () => {
    expect(service.resolve('test-correlation-123')).toBe('test-correlation-123');
  });

  it('generates a new ID when the input is missing', () => {
    expect(service.resolve(undefined)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('rejects arbitrarily long client values', () => {
    const generated = service.resolve('a'.repeat(129));
    expect(generated).not.toBe('a'.repeat(129));
    expect(generated).toHaveLength(randomUUID().length);
  });
});
