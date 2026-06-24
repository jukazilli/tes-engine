import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getBootstrapStatus(): {
    service: 'tes-engine-worker';
    status: 'initialized';
    environment: string;
  } {
    return {
      service: 'tes-engine-worker',
      status: 'initialized',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
