import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { AuthVerifyEmailRequest, AuthVerifyEmailResponse } from '@tes-engine/shared/contracts';

export class AuthVerifyEmailRequestDto implements AuthVerifyEmailRequest {
  @ApiProperty({ example: 'email-verification-token' })
  @IsString()
  @Length(32, 256)
  token!: string;
}

export class AuthVerifyEmailResponseDto implements AuthVerifyEmailResponse {
  @ApiProperty({ example: true })
  verified!: true;
}
