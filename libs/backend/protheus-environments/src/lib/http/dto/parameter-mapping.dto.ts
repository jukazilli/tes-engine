import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateParameterMappingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  environmentId!: string;

  @ApiProperty({ example: 'MV_CODREG' })
  @IsString()
  @IsNotEmpty()
  parameterName!: string;

  @ApiProperty({ example: '3' })
  @IsString()
  parameterValue!: string;

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  normalizedValue?: string | null;

  @ApiProperty({ example: 'NFE_CRT' })
  @IsString()
  canonicalDomain!: string;

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  canonicalCode?: string | null;

  @ApiProperty({ example: 'MANUAL' })
  @IsString()
  sourceType!: string;
}

export class ValidateParameterMappingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  canonicalCode?: string | null;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  version!: number;
}
