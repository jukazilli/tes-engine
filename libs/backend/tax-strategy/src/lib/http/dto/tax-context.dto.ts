import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaxContextIssueDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  message!: string;
}

export class TaxContextReadinessDto {
  @ApiProperty()
  strategyReady!: boolean;

  @ApiProperty()
  executionReady!: false;

  @ApiProperty({ type: TaxContextIssueDto, isArray: true })
  blockers!: TaxContextIssueDto[];

  @ApiProperty({ type: TaxContextIssueDto, isArray: true })
  warnings!: TaxContextIssueDto[];
}

export class TaxContextSnapshotDto {
  @ApiProperty()
  organizationId!: string;

  @ApiProperty()
  environmentId!: string;

  @ApiProperty()
  branchId!: string;

  @ApiProperty()
  referenceDate!: string;

  @ApiPropertyOptional({ nullable: true })
  fiscalProfile!: object | null;

  @ApiPropertyOptional({ nullable: true })
  strategy!: object | null;

  @ApiProperty()
  taxOwnership!: Record<string, string>;

  @ApiProperty({ type: TaxContextReadinessDto })
  readiness!: TaxContextReadinessDto;
}
