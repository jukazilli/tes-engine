import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateOrganizationRequestDto {
  @ApiProperty({ example: 'Empresa Exemplo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'empresa-exemplo' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;
}

export class UpdateOrganizationRequestDto {
  @ApiPropertyOptional({ example: 'Empresa Exemplo Atualizada' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'empresa-exemplo-atualizada' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  version!: number;
}

export class OrganizationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  version!: number;
}

export class OrganizationListItemDto extends OrganizationResponseDto {
  @ApiProperty({ type: [String] })
  roles!: string[];
}
