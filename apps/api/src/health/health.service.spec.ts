import { HealthService } from './health.service';
import { AppConfigService } from '../config/app-config.service';
import { DatabaseHealthService } from '@tes-engine/backend/database';

describe('HealthService', () => {
  const databaseHealthService = {
    check: jest.fn().mockResolvedValue({ status: 'up' }),
  } as unknown as DatabaseHealthService;

  const service = new HealthService(
    {
      value: {
        serviceName: 'tes-engine-api',
        environment: 'test',
        port: 3000,
        prefix: 'api',
        logLevel: 'silent',
        corsOrigins: ['http://localhost:4200'],
        version: '0.1.0',
        openapiEnabled: true,
        database: {
          url: 'postgresql://tes_engine_app:change-me@127.0.0.1:15432/tes_engine',
          poolMin: 0,
          poolMax: 5,
          connectionTimeoutMs: 1000,
          queryTimeoutMs: 2000,
          healthTimeoutMs: 1000,
        },
      },
    } as AppConfigService,
    databaseHealthService,
  );

  it('returns health details without external dependency checks', () => {
    expect(service.getHealth()).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'tes-engine-api',
        version: '0.1.0',
        environment: 'test',
      }),
    );
  });

  it('tracks readiness after initialization', async () => {
    expect(await service.getReadiness()).toEqual(
      expect.objectContaining({
        status: 'not_ready',
        configurationLoaded: true,
        applicationInitialized: false,
        database: { status: 'up' },
      }),
    );

    service.markInitialized();

    expect(await service.getReadiness()).toEqual(
      expect.objectContaining({
        status: 'ready',
        applicationInitialized: true,
      }),
    );
  });
});
