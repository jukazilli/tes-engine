import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { AuthRegisterRequest, AuthRegisterResponse } from '@tes-engine/shared/contracts';

export class AuthRegisterRequestDto implements AuthRegisterRequest {
  @ApiProperty({ example: 'admin@empresa.com.br' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 12, example: 'Senha-forte-123' })
  @IsString()
  @Length(12, 128)
  password!: string;

  @ApiProperty({ example: 'Juliano Pedroso' })
  @IsString()
  @Length(2, 120)
  displayName!: string;
}

export class AuthRegisterResponseDto implements AuthRegisterResponse {
  @ApiProperty({ example: true })
  emailVerificationRequired!: true;

  @ApiProperty({ format: 'uuid' })
  userId!: string;
}
