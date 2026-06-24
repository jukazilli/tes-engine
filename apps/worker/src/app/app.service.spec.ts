import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getBootstrapStatus', () => {
    it('should return the worker bootstrap status', () => {
      expect(service.getBootstrapStatus()).toEqual({
        service: 'tes-engine-worker',
        status: 'initialized',
        environment: 'test',
      });
    });
  });
});
