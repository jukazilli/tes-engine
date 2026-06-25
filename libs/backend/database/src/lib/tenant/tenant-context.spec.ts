import { assertValidTenantContext } from './tenant-context';
import { InvalidTenantContextError } from './tenant-context.errors';

describe('assertValidTenantContext', () => {
  it('accepts a valid organization and user context', () => {
    expect(() =>
      assertValidTenantContext({
        organizationId: '11111111-1111-4111-8111-111111111111',
        userId: '22222222-2222-4222-8222-222222222222',
      }),
    ).not.toThrow();
  });

  it('rejects empty or malformed tenant context', () => {
    expect(() => assertValidTenantContext({ organizationId: '' })).toThrow(
      InvalidTenantContextError,
    );
    expect(() => assertValidTenantContext({ organizationId: 'not-a-uuid' })).toThrow(
      InvalidTenantContextError,
    );
  });
});
