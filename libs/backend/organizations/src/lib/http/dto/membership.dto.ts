import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsString, Min } from 'class-validator';

export class UpdateMembershipRequestDto {
  @ApiProperty({ enum: ['ACTIVE', 'SUSPENDED', 'REVOKED'] })
  @IsIn(['ACTIVE', 'SUSPENDED', 'REVOKED'])
  status!: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  version!: number;
}

export class AssignMembershipRolesRequestDto {
  @ApiProperty({ example: ['CONSULTANT'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleCodes!: string[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  version!: number;
}

export class MembershipResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty({ required: false })
  joinedAt?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  version!: number;
}
