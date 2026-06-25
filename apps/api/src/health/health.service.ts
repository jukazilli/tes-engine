import { Injectable } from '@nestjs/common';
import { DatabaseHealthService } from '@tes-engine/backend/database';
import { HealthResponse, LivenessResponse, ReadinessResponse } from '@tes-engine/shared/contracts';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class HealthService {
  private initialized = false;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

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

  async getReadiness(): Promise<ReadinessResponse> {
    const config = this.appConfigService.value;
    const database = await this.databaseHealthService.check();
    const ready = this.initialized && database.status === 'up';

    return {
      status: ready ? 'ready' : 'not_ready',
      service: config.serviceName,
      version: config.version,
      environment: config.environment,
      timestamp: new Date().toISOString(),
      configurationLoaded: true,
      applicationInitialized: this.initialized,
      database,
    };
  }
}
