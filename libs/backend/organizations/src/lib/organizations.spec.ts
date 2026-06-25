import { ORGANIZATION_PERMISSIONS } from './domain/permission';
import { SYSTEM_ROLE_CODES } from './domain/role';

describe('organizations', () => {
  it('exposes explicit organization permissions without wildcard access', () => {
    expect(ORGANIZATION_PERMISSIONS).toContain('organization:read');
    expect(ORGANIZATION_PERMISSIONS).toContain('role:assign');
    expect(ORGANIZATION_PERMISSIONS).not.toContain('*');
  });

  it('exposes the initial system roles', () => {
    expect(SYSTEM_ROLE_CODES).toEqual(['ADMIN', 'CONSULTANT', 'TAX_ANALYST', 'APPROVER', 'VIEWER']);
  });
});
