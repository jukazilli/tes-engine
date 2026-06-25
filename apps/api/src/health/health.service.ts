import { Injectable } from '@nestjs/common';
import { HealthResponse, LivenessResponse, ReadinessResponse } from '@tes-engine/shared/contracts';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class HealthService {
  private initialized = false;

  constructor(private readonly appConfigService: AppConfigService) {}

  markInitialized(): void {
    this.initialized = true;
  }

  getHealth(): HealthResponse {
    const config = this.appConfigService.value;

    return {
      status: 'ok',
      service: config.serviceName,
      version: config.version,
      environment: config.environment,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  getLiveness(): LivenessResponse {
    return {
      status: 'alive',
      service: this.appConfigService.value.serviceName,
      timestamp: new Date().toISOString(),
    };
  }

  getReadiness(): ReadinessResponse {
    const config = this.appConfigService.value;

    return {
      status: 'ready',
      service: config.serviceName,
      version: config.version,
      environment: config.environment,
      timestamp: new Date().toISOString(),
      configurationLoaded: true,
      applicationInitialized: this.initialized,
    };
  }
}
