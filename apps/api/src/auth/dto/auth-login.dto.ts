import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { AuthLoginRequest, AuthLoginResponse } from '@tes-engine/shared/contracts';

export class AuthLoginRequestDto implements AuthLoginRequest {
  @ApiProperty({ example: 'admin@empresa.com.br' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 12, example: 'Senha-forte-123' })
  @IsString()
  @Length(12, 128)
  password!: string;
}

export class AuthLoginResponseDto implements AuthLoginResponse {
  @ApiProperty({
    example: {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'admin@empresa.com.br',
      displayName: 'Juliano Pedroso',
      status: 'ACTIVE',
    },
  })
  user!: AuthLoginResponse['user'];
}
