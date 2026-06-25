import { SetMetadata } from '@nestjs/common';
import { OrganizationPermission } from '../domain/permission';

export const REQUIRED_PERMISSIONS_METADATA = 'tes:required-permissions';

export function RequirePermissions(...permissions: OrganizationPermission[]) {
  return SetMetadata(REQUIRED_PERMISSIONS_METADATA, permissions);
}
