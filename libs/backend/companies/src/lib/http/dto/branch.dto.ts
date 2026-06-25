import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ESTABLISHMENT_TYPES } from '../../domain/reference-data';

export class BranchAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complement?: string | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  district!: string;

  @ApiProperty({ example: '89200000' })
  @IsString()
  postalCode!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cityName!: string;

  @ApiPropertyOptional({ example: '4209102' })
  @IsOptional()
  @IsString()
  municipalityIbgeCode?: string | null;

  @ApiProperty({ example: 'SC' })
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  stateCode!: string;

  @ApiProperty({ example: 'BR' })
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  countryCode!: string;
}

export class CreateBranchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string | null;

  @ApiProperty({ example: '12345678000195' })
  @IsString()
  cnpj!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  stateRegistration?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  municipalRegistration?: string | null;

  @ApiProperty({ enum: ESTABLISHMENT_TYPES, example: 'MATRIZ' })
  @IsIn(ESTABLISHMENT_TYPES)
  establishmentType!: string;

  @ApiProperty()
  @IsBoolean()
  isHeadquarters!: boolean;

  @ApiProperty({ type: BranchAddressDto })
  @ValidateNested()
  @Type(() => BranchAddressDto)
  address!: BranchAddressDto;
}

export class UpdateBranchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  stateRegistration?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  municipalRegistration?: string | null;

  @ApiPropertyOptional({ enum: ESTABLISHMENT_TYPES })
  @IsOptional()
  @IsIn(ESTABLISHMENT_TYPES)
  establishmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHeadquarters?: boolean;

  @ApiPropertyOptional({ type: BranchAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BranchAddressDto)
  address?: BranchAddressDto;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  version!: number;
}

export class BranchResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  code?: string | null;

  @ApiProperty()
  cnpj!: string;

  @ApiProperty()
  establishmentType!: string;

  @ApiProperty()
  isHeadquarters!: boolean;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  version!: number;
}
