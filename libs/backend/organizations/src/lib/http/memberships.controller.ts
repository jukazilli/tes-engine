import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  OrganizationApiRequest,
  OrganizationRequestContext,
} from '../context/organization-request-context';
import { RequirePermissions } from '../decorators/require-permissions';
import { OrganizationContextGuard } from '../guards/organization-context.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { MembershipsService } from '../application/memberships.service';
import {
  AssignMembershipRolesRequestDto,
  MembershipResponseDto,
  UpdateMembershipRequestDto,
} from './dto/membership.dto';

@ApiTags('Organization memberships')
@ApiHeader({ name: 'X-Organization-ID', required: true })
@UseGuards(OrganizationContextGuard, PermissionsGuard)
@Controller('organizations/:organizationId/members')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  @RequirePermissions('membership:read')
  @ApiOkResponse({ type: [MembershipResponseDto] })
  async list(@Req() request: OrganizationApiRequest) {
    return await this.membershipsService.list(
      request.organizationContext as OrganizationRequestContext,
    );
  }

  @Patch(':membershipId')
  @RequirePermissions('membership:update')
  @ApiOkResponse({ type: MembershipResponseDto })
  async update(
    @Param('membershipId') membershipId: string,
    @Body() body: UpdateMembershipRequestDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.membershipsService.updateStatus(
      request.organizationContext as OrganizationRequestContext,
      membershipId,
      body,
    );
  }

  @Delete(':membershipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('membership:remove')
  @ApiNoContentResponse({ description: 'Membership was revoked.' })
  async remove(
    @Param('membershipId') membershipId: string,
    @Req() request: OrganizationApiRequest,
  ): Promise<void> {
    await this.membershipsService.remove(
      request.organizationContext as OrganizationRequestContext,
      membershipId,
    );
  }

  @Put(':membershipId/roles')
  @RequirePermissions('role:assign')
  @ApiOkResponse({ type: MembershipResponseDto })
  async assignRoles(
    @Param('membershipId') membershipId: string,
    @Body() body: AssignMembershipRolesRequestDto,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.membershipsService.assignRoles(
      request.organizationContext as OrganizationRequestContext,
      membershipId,
      body,
    );
  }
}
