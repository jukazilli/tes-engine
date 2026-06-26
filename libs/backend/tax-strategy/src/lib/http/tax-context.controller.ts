import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  OrganizationApiRequest,
  OrganizationContextGuard,
  OrganizationRequestContext,
  PermissionsGuard,
  RequirePermissions,
} from '@tes-engine/backend/organizations';
import { TaxContextResolverService } from '../application/tax-context-resolver.service';
import { TaxContextSnapshotDto } from './dto/tax-context.dto';

@ApiTags('Tax context')
@ApiHeader({ name: 'X-Organization-ID', required: true })
@UseGuards(OrganizationContextGuard, PermissionsGuard)
@Controller('protheus-environments/:environmentId/tax-context')
export class TaxContextController {
  constructor(private readonly service: TaxContextResolverService) {}

  @Get('at-date')
  @RequirePermissions('tax-context:resolve')
  @ApiOkResponse({ type: TaxContextSnapshotDto })
  async atDate(
    @Param('environmentId') environmentId: string,
    @Query('date') date: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.atDate(this.context(request), environmentId, date);
  }

  private context(request: OrganizationApiRequest): OrganizationRequestContext {
    return request.organizationContext as OrganizationRequestContext;
  }
}
