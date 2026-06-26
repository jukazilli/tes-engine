import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TAX_OWNER_CODES } from '../../domain/tax-owner';
import { TAX_STRATEGY_SOURCE_TYPES, TAX_STRATEGY_STATUSES } from '../../domain/tax-strategy';
import { TAX_STRATEGY_MODES } from '../../domain/tax-strategy-mode';

export class TaxStrategyItemInputDto {
  @ApiProperty({ enum: ['ICMS', 'ICMS_ST', 'IPI', 'PIS', 'COFINS', 'ISS', 'DIFAL', 'FCP'] })
  @IsString()
  taxDomainCode!: 'ICMS' | 'ICMS_ST' | 'IPI' | 'PIS' | 'COFINS' | 'ISS' | 'DIFAL' | 'FCP';

  @ApiProperty({ enum: TAX_OWNER_CODES })
  @IsIn(TAX_OWNER_CODES)
  ownerCode!: (typeof TAX_OWNER_CODES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notApplicableReason?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class CreateTaxStrategyDto {
  @ApiProperty({ enum: TAX_STRATEGY_MODES })
  @IsIn(TAX_STRATEGY_MODES)
  mode!: (typeof TAX_STRATEGY_MODES)[number];

  @ApiProperty()
  @IsString()
  validFrom!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  validUntil?: string | null;

  @ApiProperty({ enum: TAX_STRATEGY_SOURCE_TYPES })
  @IsIn(TAX_STRATEGY_SOURCE_TYPES)
  sourceType!: (typeof TAX_STRATEGY_SOURCE_TYPES)[number];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  sourceReference?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({ type: TaxStrategyItemInputDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(32)
  @ValidateNested({ each: true })
  @Type(() => TaxStrategyItemInputDto)
  items?: TaxStrategyItemInputDto[];
}

export class UpdateTaxStrategyDto extends PartialType(CreateTaxStrategyDto) {
  @ApiProperty()
  @IsInt()
  @Min(1)
  version!: number;
}

export class TaxStrategyItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  taxDomainCode!: string;

  @ApiProperty({ enum: TAX_OWNER_CODES })
  ownerCode!: string;

  @ApiPropertyOptional({ nullable: true })
  notApplicableReason!: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  version!: number;
}

export class TaxStrategyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  environmentId!: string;

  @ApiProperty()
  branchId!: string;

  @ApiProperty({ enum: TAX_STRATEGY_MODES })
  mode!: string;

  @ApiProperty({ enum: TAX_STRATEGY_STATUSES })
  status!: string;

  @ApiProperty()
  validFrom!: string;

  @ApiPropertyOptional({ nullable: true })
  validUntil!: string | null;

  @ApiProperty({ enum: TAX_STRATEGY_SOURCE_TYPES })
  sourceType!: string;

  @ApiPropertyOptional({ nullable: true })
  sourceReference!: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiPropertyOptional({ nullable: true })
  confirmedAt!: string | null;

  @ApiProperty()
  version!: number;

  @ApiProperty({ type: TaxStrategyItemResponseDto, isArray: true })
  items!: TaxStrategyItemResponseDto[];
}

export class ValidationIssueDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  message!: string;
}

export class TaxStrategyValidationResultDto {
  @ApiProperty()
  valid!: boolean;

  @ApiProperty({ type: ValidationIssueDto, isArray: true })
  errors!: ValidationIssueDto[];

  @ApiProperty({ type: ValidationIssueDto, isArray: true })
  warnings!: ValidationIssueDto[];
}
