import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OrganizationApiRequest } from '../context/organization-request-context';
import { AuthorizationService } from '../application/authorization.service';
import { RequestAuthService } from '../application/request-auth.service';

@Injectable()
export class OrganizationContextGuard implements CanActivate {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly requestAuthService: RequestAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OrganizationApiRequest>();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      await this.requestAuthService.requireMutatingSession(request);
    }
    await this.authorizationService.requireOrganizationContext(
      request,
      request.params?.['organizationId'],
    );
    return true;
  }
}
