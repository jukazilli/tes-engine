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
import { CompaniesService } from '../application/companies.service';
import { PageQueryDto } from './dto/common.dto';
import { CompanyResponseDto, CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@ApiTags('Companies')
@ApiHeader({ name: 'X-Organization-ID', required: true })
@UseGuards(OrganizationContextGuard, PermissionsGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @RequirePermissions('company:read')
  @ApiOkResponse({ type: CompanyResponseDto, isArray: true })
  async list(@Query() query: PageQueryDto, @Req() request: OrganizationApiRequest) {
    return await this.companiesService.list(this.context(request), query);
  }

  @Post()
  @RequirePermissions('company:create')
  @ApiOkResponse({ type: CompanyResponseDto })
  async create(@Body() body: CreateCompanyDto, @Req() request: OrganizationApiRequest) {
    return await this.companiesService.create(this.context(request), body);
  }

  @Get(':companyId')
  @RequirePermissions('company:read')
  @ApiOkResponse({ type: CompanyResponseDto })
  async get(@Param('companyId') companyId: string, @Req() request: OrganizationApiRequest) {
    return await this.companiesService.get(this.context(request), companyId);
  }

  @Patch(':companyId')
  @RequirePermissions('company:update')
  @ApiOkResponse({ type: CompanyResponseDto })
  async update(
    @Param('companyId') companyId: string,
    @Body() body: UpdateCompanyDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.companiesService.update(this.context(request), companyId, body);
  }

  @Post(':companyId/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('company:deactivate')
  async deactivate(@Param('companyId') companyId: string, @Req() request: OrganizationApiRequest) {
    await this.companiesService.deactivate(this.context(request), companyId);
  }

  private context(request: OrganizationApiRequest): OrganizationRequestContext {
    return request.organizationContext as OrganizationRequestContext;
  }
}
