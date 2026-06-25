import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  OrganizationApiRequest,
  OrganizationRequestContext,
} from '../context/organization-request-context';
import { RequirePermissions } from '../decorators/require-permissions';
import { OrganizationContextGuard } from '../guards/organization-context.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequestAuthService } from '../application/request-auth.service';
import { OrganizationsService } from '../application/organizations.service';
import {
  CreateOrganizationRequestDto,
  OrganizationListItemDto,
  OrganizationResponseDto,
  UpdateOrganizationRequestDto,
} from './dto/organization.dto';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly auth: RequestAuthService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  @ApiOkResponse({ type: OrganizationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Requires a valid session and CSRF token.' })
  async create(@Body() body: CreateOrganizationRequestDto, @Req() request: OrganizationApiRequest) {
    const user = await this.auth.requireMutatingSession(request);
    return await this.organizationsService.create(body, user.userId);
  }

  @Get()
  @ApiOkResponse({ type: [OrganizationListItemDto] })
  async list(@Req() request: OrganizationApiRequest) {
    const user = await this.auth.requireSession(request);
    return await this.organizationsService.listForUser(user.userId);
  }

  @Get(':organizationId')
  @UseGuards(OrganizationContextGuard, PermissionsGuard)
  @RequirePermissions('organization:read')
  @ApiHeader({ name: 'X-Organization-ID', required: true })
  @ApiOkResponse({ type: OrganizationResponseDto })
  async get(@Req() request: OrganizationApiRequest) {
    return await this.organizationsService.get(
      request.organizationContext as OrganizationRequestContext,
    );
  }

  @Patch(':organizationId')
  @UseGuards(OrganizationContextGuard, PermissionsGuard)
  @RequirePermissions('organization:update')
  @ApiHeader({ name: 'X-Organization-ID', required: true })
  @ApiOkResponse({ type: OrganizationResponseDto })
  async update(@Body() body: UpdateOrganizationRequestDto, @Req() request: OrganizationApiRequest) {
    return await this.organizationsService.update(
      request.organizationContext as OrganizationRequestContext,
      body,
    );
  }

  @Post(':organizationId/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(OrganizationContextGuard, PermissionsGuard)
  @RequirePermissions('organization:deactivate')
  @ApiHeader({ name: 'X-Organization-ID', required: true })
  @ApiNoContentResponse({ description: 'Organization was deactivated.' })
  async deactivate(@Req() request: OrganizationApiRequest): Promise<void> {
    await this.organizationsService.deactivate(
      request.organizationContext as OrganizationRequestContext,
    );
  }
}
