import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import {
  AuthCsrfResponse,
  AuthForgotPasswordRequest,
  AuthGenericMessageResponse,
  AuthMeResponse,
  AuthResendVerificationRequest,
  AuthResetPasswordRequest,
  AuthSessionResponse,
} from '@tes-engine/shared/contracts';

export class AuthMeResponseDto implements AuthMeResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'usuario@example.test' })
  email!: string;

  @ApiProperty({ example: 'Usuario' })
  displayName!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}

export class AuthGenericMessageResponseDto implements AuthGenericMessageResponse {
  @ApiProperty({ example: 'Se houver uma conta pendente, enviaremos uma nova mensagem.' })
  message!: string;
}

export class AuthResendVerificationRequestDto implements AuthResendVerificationRequest {
  @ApiProperty({ example: 'usuario@example.test' })
  @IsEmail()
  email!: string;
}

export class AuthForgotPasswordRequestDto implements AuthForgotPasswordRequest {
  @ApiProperty({ example: 'usuario@example.test' })
  @IsEmail()
  email!: string;
}

export class AuthResetPasswordRequestDto implements AuthResetPasswordRequest {
  @ApiProperty({ example: 'password-reset-token' })
  @IsString()
  @Length(32, 256)
  token!: string;

  @ApiProperty({ minLength: 12, maxLength: 128, example: 'nova-senha-segura' })
  @IsString()
  @Length(12, 128)
  newPassword!: string;
}

export class AuthCsrfResponseDto implements AuthCsrfResponse {
  @ApiProperty({ example: 'csrf-token' })
  csrfToken!: string;
}

export class AuthSessionResponseDto implements AuthSessionResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  lastSeenAt!: string;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty()
  current!: boolean;

  @ApiProperty({ required: false })
  userAgent?: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}
