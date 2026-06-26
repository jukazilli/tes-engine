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
import { TaxStrategiesService } from '../application/tax-strategies.service';
import {
  CreateTaxStrategyDto,
  TaxStrategyResponseDto,
  TaxStrategyValidationResultDto,
  UpdateTaxStrategyDto,
} from './dto/tax-strategy.dto';

@ApiTags('Tax strategies')
@ApiHeader({ name: 'X-Organization-ID', required: true })
@UseGuards(OrganizationContextGuard, PermissionsGuard)
@Controller('protheus-environments/:environmentId/tax-strategies')
export class TaxStrategiesController {
  constructor(private readonly service: TaxStrategiesService) {}

  @Get()
  @RequirePermissions('tax-strategy:read')
  @ApiOkResponse({ type: TaxStrategyResponseDto, isArray: true })
  async list(
    @Param('environmentId') environmentId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.list(this.context(request), environmentId);
  }

  @Post()
  @RequirePermissions('tax-strategy:create')
  @ApiOkResponse({ type: TaxStrategyResponseDto })
  async create(
    @Param('environmentId') environmentId: string,
    @Body() body: CreateTaxStrategyDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.create(this.context(request), environmentId, body);
  }

  @Get('current')
  @RequirePermissions('tax-strategy:read')
  @ApiOkResponse({ type: TaxStrategyResponseDto })
  async current(
    @Param('environmentId') environmentId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.current(this.context(request), environmentId);
  }

  @Get('at-date')
  @RequirePermissions('tax-strategy:read')
  @ApiOkResponse({ type: TaxStrategyResponseDto })
  async atDate(
    @Param('environmentId') environmentId: string,
    @Query('date') date: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.atDate(this.context(request), environmentId, date);
  }

  @Get(':strategyId')
  @RequirePermissions('tax-strategy:read')
  @ApiOkResponse({ type: TaxStrategyResponseDto })
  async get(
    @Param('environmentId') environmentId: string,
    @Param('strategyId') strategyId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.get(this.context(request), environmentId, strategyId);
  }

  @Patch(':strategyId')
  @RequirePermissions('tax-strategy:update')
  @ApiOkResponse({ type: TaxStrategyResponseDto })
  async update(
    @Param('environmentId') environmentId: string,
    @Param('strategyId') strategyId: string,
    @Body() body: UpdateTaxStrategyDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.update(this.context(request), environmentId, strategyId, body);
  }

  @Post(':strategyId/validate')
  @RequirePermissions('tax-strategy:read')
  @ApiOkResponse({ type: TaxStrategyValidationResultDto })
  async validate(
    @Param('environmentId') environmentId: string,
    @Param('strategyId') strategyId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.validate(this.context(request), environmentId, strategyId);
  }

  @Post(':strategyId/submit-review')
  @RequirePermissions('tax-strategy:submit-review')
  @ApiOkResponse({ type: TaxStrategyResponseDto })
  async submitReview(
    @Param('environmentId') environmentId: string,
    @Param('strategyId') strategyId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.submitReview(this.context(request), environmentId, strategyId);
  }

  @Post(':strategyId/confirm')
  @RequirePermissions('tax-strategy:confirm')
  @ApiOkResponse({ type: TaxStrategyResponseDto })
  async confirm(
    @Param('environmentId') environmentId: string,
    @Param('strategyId') strategyId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.service.confirm(this.context(request), environmentId, strategyId);
  }

  @Post(':strategyId/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('tax-strategy:deactivate')
  async deactivate(
    @Param('environmentId') environmentId: string,
    @Param('strategyId') strategyId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    await this.service.deactivate(this.context(request), environmentId, strategyId);
  }

  private context(request: OrganizationApiRequest): OrganizationRequestContext {
    return request.organizationContext as OrganizationRequestContext;
  }
}
