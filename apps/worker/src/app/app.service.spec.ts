import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
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
