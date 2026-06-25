import { Controller, Get, Header } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponse, LivenessResponse, ReadinessResponse } from '@tes-engine/shared/contracts';
import { CORRELATION_ID_HEADER } from '../common/middleware/correlation-id.constants';
import { HealthResponseDto } from './dto/health-response.dto';
import { LivenessResponseDto } from './dto/liveness-response.dto';
import { ReadinessResponseDto } from './dto/readiness-response.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@ApiHeader({
  name: CORRELATION_ID_HEADER,
  required: false,
  description: 'Correlation identifier returned in responses and logs.',
})
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({ type: HealthResponseDto })
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }

  @Get('live')
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({ type: LivenessResponseDto })
  getLiveness(): LivenessResponse {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({ type: ReadinessResponseDto })
  getReadiness(): ReadinessResponse {
    return this.healthService.getReadiness();
  }
}
