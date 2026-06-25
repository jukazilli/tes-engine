import { ORGANIZATION_PERMISSIONS } from '@tes-engine/backend/organizations';

describe('master-data', () => {
  it('registers master data RBAC permissions explicitly', () => {
    expect(ORGANIZATION_PERMISSIONS).toEqual(
      expect.arrayContaining([
        'company:create',
        'branch:create',
        'environment:create',
        'branch-fiscal-profile:confirm',
        'protheus-parameter-mapping:validate',
      ]),
    );
    expect(ORGANIZATION_PERMISSIONS).not.toContain('*');
  });
});
