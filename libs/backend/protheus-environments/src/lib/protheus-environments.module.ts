import { Module } from '@nestjs/common';
import { TenantSqlRepository } from '@tes-engine/backend/companies';
import {
  OrganizationContextGuard,
  OrganizationsModule,
  PermissionsGuard,
} from '@tes-engine/backend/organizations';
import { ParameterMappingsService } from './application/parameter-mappings.service';
import { ProtheusEnvironmentsService } from './application/protheus-environments.service';
import { ParameterMappingsController } from './http/parameter-mappings.controller';
import { ProtheusEnvironmentsController } from './http/protheus-environments.controller';

@Module({
  imports: [OrganizationsModule],
  controllers: [ProtheusEnvironmentsController, ParameterMappingsController],
  providers: [
    TenantSqlRepository,
    ProtheusEnvironmentsService,
    ParameterMappingsService,
    OrganizationContextGuard,
    PermissionsGuard,
  ],
  exports: [ProtheusEnvironmentsService, ParameterMappingsService],
})
export class ProtheusEnvironmentsModule {}
