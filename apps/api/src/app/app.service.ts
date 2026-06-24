import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: 'ok'; service: 'tes-engine-api' } {
    return {
      status: 'ok',
      service: 'tes-engine-api',
    };
  }
}
