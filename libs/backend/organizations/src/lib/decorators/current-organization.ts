import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OrganizationApiRequest } from '../context/organization-request-context';

export const CurrentOrganization = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<OrganizationApiRequest>();
    return request.organizationContext;
  },
);
