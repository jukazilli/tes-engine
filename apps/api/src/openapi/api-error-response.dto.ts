import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'RESOURCE_NOT_FOUND' })
  code!: string;

  @ApiProperty({ example: 'Resource not found.' })
  message!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/api/missing' })
  path!: string;

  @ApiProperty({ example: 'GET' })
  method!: string;

  @ApiProperty({ example: 'test-correlation-123' })
  correlationId!: string;

  @ApiPropertyOptional({
    example: {
      name: ['name should not be empty'],
    },
  })
  fieldErrors?: Record<string, string[]>;
}
