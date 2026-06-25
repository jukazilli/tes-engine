import { HealthService } from './health.service';
import { AppConfigService } from '../config/app-config.service';

describe('HealthService', () => {
  const service = new HealthService({
    value: {
      serviceName: 'tes-engine-api',
      environment: 'test',
      port: 3000,
      prefix: 'api',
      logLevel: 'silent',
      corsOrigins: ['http://localhost:4200'],
      version: '0.1.0',
      openapiEnabled: true,
    },
  } as AppConfigService);

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

  it('tracks readiness after initialization', () => {
    expect(service.getReadiness()).toEqual(
      expect.objectContaining({
        status: 'ready',
        configurationLoaded: true,
        applicationInitialized: false,
      }),
    );

    service.markInitialized();

    expect(service.getReadiness()).toEqual(
      expect.objectContaining({
        applicationInitialized: true,
      }),
    );
  });
});
