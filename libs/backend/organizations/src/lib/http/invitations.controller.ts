import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  OrganizationApiRequest,
  OrganizationRequestContext,
} from '../context/organization-request-context';
import { RequestAuthService } from '../application/request-auth.service';
import { InvitationsService } from '../application/invitations.service';
import { RequirePermissions } from '../decorators/require-permissions';
import { OrganizationContextGuard } from '../guards/organization-context.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import {
  AcceptInvitationRequestDto,
  CreateInvitationRequestDto,
  InvitationPreviewResponseDto,
  InvitationResponseDto,
} from './dto/invitation.dto';

@ApiTags('Organization invitations')
@Controller()
export class InvitationsController {
  constructor(
    private readonly auth: RequestAuthService,
    private readonly invitationsService: InvitationsService,
  ) {}

  @Post('organizations/:organizationId/invitations')
  @UseGuards(OrganizationContextGuard, PermissionsGuard)
  @RequirePermissions('invitation:create')
  @ApiHeader({ name: 'X-Organization-ID', required: true })
  @ApiOkResponse({ type: InvitationResponseDto })
  async create(@Body() body: CreateInvitationRequestDto, @Req() request: OrganizationApiRequest) {
    return await this.invitationsService.create(
      request.organizationContext as OrganizationRequestContext,
      body,
    );
  }

  @Get('organizations/:organizationId/invitations')
  @UseGuards(OrganizationContextGuard, PermissionsGuard)
  @RequirePermissions('invitation:read')
  @ApiHeader({ name: 'X-Organization-ID', required: true })
  @ApiOkResponse({ type: [InvitationResponseDto] })
  async list(@Req() request: OrganizationApiRequest) {
    return await this.invitationsService.list(
      request.organizationContext as OrganizationRequestContext,
    );
  }

  @Post('organizations/:organizationId/invitations/:invitationId/resend')
  @UseGuards(OrganizationContextGuard, PermissionsGuard)
  @RequirePermissions('invitation:resend')
  @ApiHeader({ name: 'X-Organization-ID', required: true })
  @ApiOkResponse({ type: InvitationResponseDto })
  async resend(
    @Param('invitationId') invitationId: string,
    @Req() request: OrganizationApiRequest,
  ) {
    return await this.invitationsService.resend(
      request.organizationContext as OrganizationRequestContext,
      invitationId,
      request.ip ?? request.socket?.remoteAddress,
    );
  }

  @Delete('organizations/:organizationId/invitations/:invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(OrganizationContextGuard, PermissionsGuard)
  @RequirePermissions('invitation:revoke')
  @ApiHeader({ name: 'X-Organization-ID', required: true })
  @ApiNoContentResponse({ description: 'Invitation was revoked.' })
  async revoke(
    @Param('invitationId') invitationId: string,
    @Req() request: OrganizationApiRequest,
  ): Promise<void> {
    await this.invitationsService.revoke(
      request.organizationContext as OrganizationRequestContext,
      invitationId,
    );
  }

  @Get('organization-invitations/preview')
  @ApiOkResponse({ type: InvitationPreviewResponseDto })
  async preview(@Query('token') token: string) {
    return await this.invitationsService.preview(token);
  }

  @Post('organization-invitations/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Invitation accepted.' })
  async accept(
    @Body() body: AcceptInvitationRequestDto,
    @Req() request: OrganizationApiRequest,
  ): Promise<void> {
    const user = await this.auth.requireMutatingSession(request);
    await this.invitationsService.accept(user, body.token);
  }
}
