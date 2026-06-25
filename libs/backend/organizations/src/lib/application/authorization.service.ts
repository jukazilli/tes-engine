import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_POOL, DatabasePool } from '@tes-engine/backend/database';
import { ConfigService } from '@nestjs/config';
import {
  organizationContextMismatch,
  organizationContextRequired,
  permissionDenied,
} from '../domain/organization.errors';
import {
  OrganizationApiRequest,
  OrganizationRequestContext,
} from '../context/organization-request-context';
import { OrganizationPermission } from '../domain/permission';
import { RequestAuthService } from './request-auth.service';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: DatabasePool,
    private readonly configService: ConfigService,
    private readonly requestAuthService: RequestAuthService,
  ) {}

  async requireOrganizationContext(
    request: OrganizationApiRequest,
    routeOrganizationId?: string,
  ): Promise<OrganizationRequestContext> {
    if (request.organizationContext) {
      return request.organizationContext;
    }

    const user = await this.requestAuthService.requireSession(request);
    const headerName = this.configService.get('ORGANIZATION_HEADER_NAME') ?? 'X-Organization-ID';
    const organizationId = this.requestAuthService.header(request, headerName);
    if (!organizationId || !UUID_PATTERN.test(organizationId)) {
      throw organizationContextRequired();
    }
    if (routeOrganizationId && organizationId !== routeOrganizationId) {
      throw organizationContextMismatch();
    }

    const result = await this.pool.query(
      'SELECT membership_id, role_codes, permission_codes FROM app_private.permissions_for_user($1, $2) LIMIT 1',
      [user.userId, organizationId],
    );
    const row = result.rows[0];
    if (!row) {
      throw organizationContextRequired();
    }

    const context: OrganizationRequestContext = {
      organizationId,
      membershipId: row.membership_id,
      roleCodes: row.role_codes ?? [],
      permissionCodes: row.permission_codes ?? [],
      user,
    };
    request.organizationContext = context;
    return context;
  }

  assertPermissions(context: OrganizationRequestContext, permissions: OrganizationPermission[]) {
    const granted = new Set(context.permissionCodes);
    if (!permissions.every((permission) => granted.has(permission))) {
      throw permissionDenied();
    }
  }
}
