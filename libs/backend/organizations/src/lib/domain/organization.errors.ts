import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

export function authenticationRequired(): UnauthorizedException {
  return new UnauthorizedException('AUTHENTICATION_REQUIRED');
}

export function organizationContextRequired(): ForbiddenException {
  return new ForbiddenException('ORGANIZATION_CONTEXT_REQUIRED');
}

export function organizationContextMismatch(): ForbiddenException {
  return new ForbiddenException('ORGANIZATION_CONTEXT_MISMATCH');
}

export function permissionDenied(): ForbiddenException {
  return new ForbiddenException('PERMISSION_DENIED');
}

export function lastAdminRequired(): ConflictException {
  return new ConflictException('LAST_ADMIN_REQUIRED');
}

export function resourceNotFound(): NotFoundException {
  return new NotFoundException('RESOURCE_NOT_FOUND');
}

export function invalidInvitation(): UnprocessableEntityException {
  return new UnprocessableEntityException('INVALID_OR_EXPIRED_INVITATION');
}
