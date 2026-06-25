import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  OrganizationApiRequest,
  OrganizationContextGuard,
  OrganizationRequestContext,
  PermissionsGuard,
  RequirePermissions,
} from '@tes-engine/backend/organizations';
import { ParameterMappingsService } from '../application/parameter-mappings.service';
import {
  CreateParameterMappingDto,
  ValidateParameterMappingDto,
} from './dto/parameter-mapping.dto';

@ApiTags('Protheus parameter mappings')
@ApiHeader({ name: 'X-Organization-ID', required: true })
@UseGuards(OrganizationContextGuard, PermissionsGuard)
@Controller('protheus-parameter-mappings')
export class ParameterMappingsController {
  constructor(private readonly service: ParameterMappingsService) {}

  @Get('environment/:environmentId')
  @RequirePermissions('protheus-parameter-mapping:read')
  @ApiOkResponse({ description: 'Parameter mappings for an environment.' })
  async list(
    @Param('environmentId') environmentId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.list(this.context(request), environmentId);
  }

  @Post()
  @RequirePermissions('protheus-parameter-mapping:create')
  async create(@Body() body: CreateParameterMappingDto, @Req() request: OrganizationApiRequest) {
    return await this.service.create(this.context(request), body);
  }

  @Post(':mappingId/validate')
  @RequirePermissions('protheus-parameter-mapping:validate')
  async validate(
    @Param('mappingId') mappingId: string,
    @Body() body: ValidateParameterMappingDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.validate(this.context(request), mappingId, body);
  }

  private context(request: OrganizationApiRequest): OrganizationRequestContext {
    return request.organizationContext as OrganizationRequestContext;
  }
}
