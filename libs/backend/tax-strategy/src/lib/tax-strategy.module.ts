import { Module } from '@nestjs/common';
import { TenantSqlRepository } from '@tes-engine/backend/companies';
import {
  OrganizationContextGuard,
  OrganizationsModule,
  PermissionsGuard,
} from '@tes-engine/backend/organizations';
import { TaxContextResolverService } from './application/tax-context-resolver.service';
import { TaxDomainsService } from './application/tax-domains.service';
import { TaxStrategiesService } from './application/tax-strategies.service';
import { TaxStrategyValidationService } from './application/tax-strategy-validation.service';
import { TaxContextController } from './http/tax-context.controller';
import { TaxReferenceDataController } from './http/tax-reference-data.controller';
import { TaxStrategiesController } from './http/tax-strategies.controller';

@Module({
  imports: [OrganizationsModule],
  controllers: [TaxStrategiesController, TaxContextController, TaxReferenceDataController],
  providers: [
    TenantSqlRepository,
    TaxDomainsService,
    TaxStrategiesService,
    TaxStrategyValidationService,
    TaxContextResolverService,
    OrganizationContextGuard,
    PermissionsGuard,
  ],
  exports: [TaxStrategiesService, TaxContextResolverService, TaxStrategyValidationService],
})
export class TaxStrategyModule {}
