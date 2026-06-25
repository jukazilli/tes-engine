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
import { FiscalProfilesService } from '../application/fiscal-profiles.service';
import {
  CreateFiscalProfileDto,
  FiscalProfileResponseDto,
  UpdateFiscalProfileDto,
} from './dto/fiscal-profile.dto';

@ApiTags('Branch fiscal profiles')
@ApiHeader({ name: 'X-Organization-ID', required: true })
@UseGuards(OrganizationContextGuard, PermissionsGuard)
@Controller('branches/:branchId/fiscal-profiles')
export class FiscalProfilesController {
  constructor(private readonly fiscalProfilesService: FiscalProfilesService) {}

  @Get()
  @RequirePermissions('branch-fiscal-profile:read')
  @ApiOkResponse({ type: FiscalProfileResponseDto, isArray: true })
  async list(@Param('branchId') branchId: string, @Req() request: OrganizationApiRequest) {
    return await this.fiscalProfilesService.list(this.context(request), branchId);
  }

  @Post()
  @RequirePermissions('branch-fiscal-profile:create')
  @ApiOkResponse({ type: FiscalProfileResponseDto })
  async create(
    @Param('branchId') branchId: string,
    @Body() body: CreateFiscalProfileDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.fiscalProfilesService.create(this.context(request), branchId, body);
  }

  @Get('current')
  @RequirePermissions('branch-fiscal-profile:read')
  @ApiOkResponse({ type: FiscalProfileResponseDto })
  async current(@Param('branchId') branchId: string, @Req() request: OrganizationApiRequest) {
    return await this.fiscalProfilesService.current(this.context(request), branchId);
  }

  @Get('at-date')
  @RequirePermissions('branch-fiscal-profile:read')
  @ApiOkResponse({ type: FiscalProfileResponseDto })
  async atDate(
    @Param('branchId') branchId: string,
    @Query('date') date: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.fiscalProfilesService.atDate(this.context(request), branchId, date);
  }

  @Patch(':profileId')
  @RequirePermissions('branch-fiscal-profile:update')
  @ApiOkResponse({ type: FiscalProfileResponseDto })
  async update(
    @Param('branchId') branchId: string,
    @Param('profileId') profileId: string,
    @Body() body: UpdateFiscalProfileDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.fiscalProfilesService.update(
      this.context(request),
      branchId,
      profileId,
      body,
    );
  }

  @Post(':profileId/confirm')
  @RequirePermissions('branch-fiscal-profile:confirm')
  @ApiOkResponse({ type: FiscalProfileResponseDto })
  async confirm(
    @Param('branchId') branchId: string,
    @Param('profileId') profileId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.fiscalProfilesService.confirm(this.context(request), branchId, profileId);
  }

  @Post(':profileId/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('branch-fiscal-profile:deactivate')
  async deactivate(
    @Param('branchId') branchId: string,
    @Param('profileId') profileId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    await this.fiscalProfilesService.deactivate(this.context(request), branchId, profileId);
  }

  private context(request: OrganizationApiRequest): OrganizationRequestContext {
    return request.organizationContext as OrganizationRequestContext;
  }
}
