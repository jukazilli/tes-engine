import {
  ORGANIZATION_PERMISSIONS,
  REQUIRED_PERMISSIONS_METADATA,
  RequirePermissions,
} from '@tes-engine/backend/organizations';

describe('organizations rbac invitations tenant-authorization', () => {
  it('declares explicit permissions without wildcard access', () => {
    expect(ORGANIZATION_PERMISSIONS).toEqual(
      expect.arrayContaining([
        'organization:read',
        'organization:update',
        'organization:deactivate',
        'membership:read',
        'membership:invite',
        'membership:update',
        'membership:remove',
        'invitation:read',
        'invitation:create',
        'invitation:resend',
        'invitation:revoke',
        'role:read',
        'role:assign',
        'company:read',
        'branch:read',
        'environment:read',
        'branch-fiscal-profile:read',
        'protheus-parameter-mapping:read',
      ]),
    );
    expect(ORGANIZATION_PERMISSIONS).not.toContain('*');
  });

  it('stores required permissions metadata for guards', () => {
    class TestController {
      @RequirePermissions('membership:invite')
      invite() {
        return true;
      }
    }

    const permissions = Reflect.getMetadata(
      REQUIRED_PERMISSIONS_METADATA,
      TestController.prototype.invite,
    );

    expect(permissions).toEqual(['membership:invite']);
  });
});
