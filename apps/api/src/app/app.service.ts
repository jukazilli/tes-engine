import { Injectable } from '@nestjs/common';
import { HealthResponse } from '@tes-engine/shared/contracts';

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'tes-engine-api',
    };
  }
}
