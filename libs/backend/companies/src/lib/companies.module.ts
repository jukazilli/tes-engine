import { Module } from '@nestjs/common';
import {
  OrganizationContextGuard,
  OrganizationsModule,
  PermissionsGuard,
} from '@tes-engine/backend/organizations';
import { BranchesService } from './application/branches.service';
import { CompaniesService } from './application/companies.service';
import { FiscalProfilesService } from './application/fiscal-profiles.service';
import { TenantSqlRepository } from './infrastructure/tenant-sql.repository';
import { BranchesController } from './http/branches.controller';
import { CompaniesController } from './http/companies.controller';
import { FiscalProfilesController } from './http/fiscal-profiles.controller';
import { ReferenceDataController } from './http/reference-data.controller';

@Module({
  imports: [OrganizationsModule],
  controllers: [
    CompaniesController,
    BranchesController,
    FiscalProfilesController,
    ReferenceDataController,
  ],
  providers: [
    TenantSqlRepository,
    CompaniesService,
    BranchesService,
    FiscalProfilesService,
    OrganizationContextGuard,
    PermissionsGuard,
  ],
  exports: [CompaniesService, BranchesService, FiscalProfilesService],
})
export class CompaniesModule {}
