import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationApiRequest } from '../context/organization-request-context';
import { AuthorizationService } from '../application/authorization.service';
import { REQUIRED_PERMISSIONS_METADATA } from '../decorators/require-permissions';
import { organizationContextRequired } from '../domain/organization.errors';
import { OrganizationPermission } from '../domain/permission';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<OrganizationPermission[]>(
      REQUIRED_PERMISSIONS_METADATA,
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest<OrganizationApiRequest>();
    if (!request.organizationContext) {
      throw organizationContextRequired();
    }
    this.authorizationService.assertPermissions(request.organizationContext, required ?? []);
    return true;
  }
}
