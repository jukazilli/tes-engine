import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  OrganizationApiRequest,
  OrganizationContextGuard,
  OrganizationRequestContext,
  PermissionsGuard,
  RequirePermissions,
} from '@tes-engine/backend/organizations';
import { ProtheusEnvironmentsService } from '../application/protheus-environments.service';
import {
  CreateProtheusEnvironmentDto,
  ProtheusEnvironmentResponseDto,
  UpdateProtheusEnvironmentDto,
} from './dto/protheus-environment.dto';

@ApiTags('Protheus environments')
@ApiHeader({ name: 'X-Organization-ID', required: true })
@UseGuards(OrganizationContextGuard, PermissionsGuard)
@Controller('protheus-environments')
export class ProtheusEnvironmentsController {
  constructor(private readonly service: ProtheusEnvironmentsService) {}

  @Get()
  @RequirePermissions('environment:read')
  @ApiOkResponse({ type: ProtheusEnvironmentResponseDto, isArray: true })
  async list(
    @Query('branchId') branchId: string | undefined,
    @Query('status') status: string | undefined,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.list(this.context(request), { branchId, status });
  }

  @Post()
  @RequirePermissions('environment:create')
  @ApiOkResponse({ type: ProtheusEnvironmentResponseDto })
  async create(@Body() body: CreateProtheusEnvironmentDto, @Req() request: OrganizationApiRequest) {
    return await this.service.create(this.context(request), body);
  }

  @Get(':environmentId')
  @RequirePermissions('environment:read')
  @ApiOkResponse({ type: ProtheusEnvironmentResponseDto })
  async get(@Param('environmentId') environmentId: string, @Req() request: OrganizationApiRequest) {
    return await this.service.get(this.context(request), environmentId);
  }

  @Patch(':environmentId')
  @RequirePermissions('environment:update')
  @ApiOkResponse({ type: ProtheusEnvironmentResponseDto })
  async update(
    @Param('environmentId') environmentId: string,
    @Body() body: UpdateProtheusEnvironmentDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.update(this.context(request), environmentId, body);
  }

  @Post(':environmentId/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('environment:deactivate')
  async deactivate(
    @Param('environmentId') environmentId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    await this.service.deactivate(this.context(request), environmentId);
  }

  private context(request: OrganizationApiRequest): OrganizationRequestContext {
    return request.organizationContext as OrganizationRequestContext;
  }
}
