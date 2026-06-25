import { OrganizationPermission } from '../domain/permission';

export interface AuthenticatedUserContext {
  sessionId: string;
  userId: string;
  email: string;
  displayName: string;
  status: string;
  csrfTokenHash: string;
}

export interface OrganizationRequestContext {
  organizationId: string;
  membershipId: string;
  roleCodes: string[];
  permissionCodes: OrganizationPermission[];
  user: AuthenticatedUserContext;
}

export interface OrganizationApiRequest {
  headers: Record<string, string | string[] | undefined>;
  method: string;
  params?: Record<string, string | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
  organizationContext?: OrganizationRequestContext;
  authenticatedUser?: AuthenticatedUserContext;
}
