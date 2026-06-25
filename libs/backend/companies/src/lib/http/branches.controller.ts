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
import { BranchesService } from '../application/branches.service';
import { PageQueryDto } from './dto/common.dto';
import { BranchResponseDto, CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@ApiTags('Branches')
@ApiHeader({ name: 'X-Organization-ID', required: true })
@UseGuards(OrganizationContextGuard, PermissionsGuard)
@Controller()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get('companies/:companyId/branches')
  @RequirePermissions('branch:read')
  @ApiOkResponse({ type: BranchResponseDto, isArray: true })
  async list(
    @Param('companyId') companyId: string,
    @Query() query: PageQueryDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.branchesService.list(this.context(request), companyId, query);
  }

  @Post('companies/:companyId/branches')
  @RequirePermissions('branch:create')
  @ApiOkResponse({ type: BranchResponseDto })
  async create(
    @Param('companyId') companyId: string,
    @Body() body: CreateBranchDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.branchesService.create(this.context(request), companyId, body);
  }

  @Get('branches/:branchId')
  @RequirePermissions('branch:read')
  @ApiOkResponse({ type: BranchResponseDto })
  async get(@Param('branchId') branchId: string, @Req() request: OrganizationApiRequest) {
    return await this.branchesService.get(this.context(request), branchId);
  }

  @Patch('branches/:branchId')
  @RequirePermissions('branch:update')
  @ApiOkResponse({ type: BranchResponseDto })
  async update(
    @Param('branchId') branchId: string,
    @Body() body: UpdateBranchDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.branchesService.update(this.context(request), branchId, body);
  }

  @Post('branches/:branchId/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('branch:deactivate')
  async deactivate(@Param('branchId') branchId: string, @Req() request: OrganizationApiRequest) {
    await this.branchesService.deactivate(this.context(request), branchId);
  }

  private context(request: OrganizationApiRequest): OrganizationRequestContext {
    return request.organizationContext as OrganizationRequestContext;
  }
}
