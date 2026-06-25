import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateInvitationRequestDto {
  @ApiProperty({ example: 'convidado@example.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'CONSULTANT' })
  @IsString()
  @IsNotEmpty()
  roleCode!: string;
}

export class AcceptInvitationRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class InvitationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  invitedEmail!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  roleCode!: string;

  @ApiProperty()
  roleName!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  lastSentAt!: string;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty()
  resendCount!: number;

  @ApiProperty()
  version!: number;
}

export class InvitationPreviewResponseDto {
  @ApiProperty()
  organizationName!: string;

  @ApiProperty()
  roleName!: string;

  @ApiProperty()
  expiresAt!: string;
}
