import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PROTHEUS_ENVIRONMENT_TYPES } from '../../validation/protheus-environment.validation';

export class CreateProtheusEnvironmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({ example: 'Homologacao 25.10' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: PROTHEUS_ENVIRONMENT_TYPES })
  @IsIn(PROTHEUS_ENVIRONMENT_TYPES)
  environmentType!: string;

  @ApiProperty({ example: 'PROTHEUS' })
  @IsString()
  @IsNotEmpty()
  protheusProduct!: string;

  @ApiProperty({ example: '12' })
  @IsString()
  protheusMajorVersion!: string;

  @ApiProperty({ example: '12.1.2510' })
  @IsString()
  protheusRelease!: string;

  @ApiProperty({ example: '01' })
  @IsString()
  @MaxLength(20)
  protheusCompanyCode!: string;

  @ApiProperty({ example: '01' })
  @IsString()
  @MaxLength(20)
  protheusBranchCode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;
}

export class UpdateProtheusEnvironmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ enum: PROTHEUS_ENVIRONMENT_TYPES })
  @IsOptional()
  @IsIn(PROTHEUS_ENVIRONMENT_TYPES)
  environmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  protheusMajorVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  protheusRelease?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  protheusCompanyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  protheusBranchCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  version!: number;
}

export class ProtheusEnvironmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  branchId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  environmentType!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  protheusRelease!: string;

  @ApiProperty()
  protheusCompanyCode!: string;

  @ApiProperty()
  protheusBranchCode!: string;

  @ApiProperty()
  version!: number;
}
