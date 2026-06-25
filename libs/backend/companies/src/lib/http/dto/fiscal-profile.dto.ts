import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  BRANCH_FISCAL_PROFILE_STATUSES,
  FISCAL_SOURCE_TYPES,
  ICMS_TAXPAYER_INDICATORS,
  NFE_CRT_CODES,
  TAX_REGIME_CODES,
} from '../../domain/reference-data';

export class CreateFiscalProfileDto {
  @ApiProperty({ enum: TAX_REGIME_CODES })
  @IsIn(TAX_REGIME_CODES)
  taxRegimeCode!: string;

  @ApiProperty({ enum: NFE_CRT_CODES })
  @IsIn(NFE_CRT_CODES)
  nfeCrtCode!: string;

  @ApiProperty({ enum: ICMS_TAXPAYER_INDICATORS })
  @IsIn(ICMS_TAXPAYER_INDICATORS)
  icmsTaxpayerIndicator!: string;

  @ApiPropertyOptional({ example: 'MV_CODREG' })
  @IsOptional()
  @IsString()
  protheusParameterName?: string | null;

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  protheusParameterValue?: string | null;

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  protheusParameterNormalizedValue?: string | null;

  @ApiProperty({ enum: FISCAL_SOURCE_TYPES })
  @IsIn(FISCAL_SOURCE_TYPES)
  sourceType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceReference?: string | null;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  validFrom!: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  validUntil?: string | null;
}

export class UpdateFiscalProfileDto extends CreateFiscalProfileDto {
  @ApiProperty({ enum: BRANCH_FISCAL_PROFILE_STATUSES })
  @IsOptional()
  @IsIn(BRANCH_FISCAL_PROFILE_STATUSES)
  status?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  version!: number;
}

export class FiscalProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  branchId!: string;

  @ApiProperty()
  taxRegimeCode!: string;

  @ApiProperty()
  nfeCrtCode!: string;

  @ApiProperty()
  icmsTaxpayerIndicator!: string;

  @ApiProperty()
  sourceType!: string;

  @ApiProperty()
  validFrom!: string;

  @ApiPropertyOptional()
  validUntil?: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  version!: number;
}
