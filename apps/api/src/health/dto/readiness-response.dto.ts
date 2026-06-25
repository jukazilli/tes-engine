import { ApiProperty } from '@nestjs/swagger';

class DatabaseReadinessDto {
  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  status!: 'up' | 'down';
}

export class ReadinessResponseDto {
  @ApiProperty({ enum: ['ready', 'not_ready'], example: 'ready' })
  status!: 'ready' | 'not_ready';

  @ApiProperty({ example: 'tes-engine-api' })
  service!: string;

  @ApiProperty({ example: '0.1.0' })
  version!: string;

  @ApiProperty({ example: 'development' })
  environment!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: true })
  configurationLoaded!: boolean;

  @ApiProperty({ example: true })
  applicationInitialized!: boolean;

  @ApiProperty({ type: DatabaseReadinessDto })
  database!: DatabaseReadinessDto;
}
