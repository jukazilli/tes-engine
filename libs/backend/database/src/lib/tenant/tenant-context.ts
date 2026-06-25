import { InvalidTenantContextError } from './tenant-context.errors';

export interface TenantContext {
  organizationId: string;
  userId?: string;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertValidTenantContext(context: TenantContext): void {
  if (!context.organizationId || !uuidPattern.test(context.organizationId)) {
    throw new InvalidTenantContextError('organizationId must be a valid UUID.');
  }

  if (context.userId !== undefined && !uuidPattern.test(context.userId)) {
    throw new InvalidTenantContextError('userId must be a valid UUID.');
  }
}
