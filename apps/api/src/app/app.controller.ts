import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      service: 'tes-engine-api',
      status: 'ok',
    };
  }
}
