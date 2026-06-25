import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';
import { TAX_REGIME_CODES } from '../../domain/reference-data';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Empresa Exemplo Ltda.' })
  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @ApiPropertyOptional({ example: 'Empresa Exemplo' })
  @IsOptional()
  @IsString()
  tradeName?: string | null;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @Matches(/^\D*\d[\d.\-/ ]*$/)
  taxIdRoot!: string;

  @ApiProperty({ enum: TAX_REGIME_CODES, example: 'LUCRO_REAL' })
  @IsIn(TAX_REGIME_CODES)
  taxRegime!: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  legalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeName?: string | null;

  @ApiPropertyOptional({ enum: TAX_REGIME_CODES })
  @IsOptional()
  @IsIn(TAX_REGIME_CODES)
  taxRegime?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  version!: number;
}

export class CompanyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  legalName!: string;

  @ApiPropertyOptional()
  tradeName?: string | null;

  @ApiProperty()
  taxIdRoot!: string;

  @ApiProperty()
  taxRegime!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  version!: number;
}
