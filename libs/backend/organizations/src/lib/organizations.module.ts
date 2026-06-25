import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationService } from './application/authorization.service';
import { InvitationsService } from './application/invitations.service';
import { MembershipsService } from './application/memberships.service';
import { OrganizationMailerService } from './application/organization-mailer.service';
import { OrganizationRateLimitService } from './application/organization-rate-limit.service';
import { OrganizationsService } from './application/organizations.service';
import { RequestAuthService } from './application/request-auth.service';
import { OrganizationContextGuard } from './guards/organization-context.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { TenantPgRepository } from './infrastructure/tenant-pg.repository';
import { InvitationsController } from './http/invitations.controller';
import { MembershipsController } from './http/memberships.controller';
import { OrganizationsController } from './http/organizations.controller';

@Module({
  imports: [ConfigModule],
  controllers: [OrganizationsController, MembershipsController, InvitationsController],
  providers: [
    AuthorizationService,
    InvitationsService,
    MembershipsService,
    OrganizationContextGuard,
    OrganizationMailerService,
    OrganizationRateLimitService,
    OrganizationsService,
    PermissionsGuard,
    RequestAuthService,
    TenantPgRepository,
  ],
  exports: [AuthorizationService, RequestAuthService],
})
export class OrganizationsModule {}
