import { registerAs } from '@nestjs/config';
import { AppConfig } from './environment.types';
import { parseCorsOrigins } from './environment.schema';

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    serviceName: 'tes-engine-api',
    environment: process.env.NODE_ENV as AppConfig['environment'],
    port: Number(process.env.API_PORT),
    prefix: process.env.API_PREFIX ?? 'api',
    logLevel: process.env.LOG_LEVEL as AppConfig['logLevel'],
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS ?? ''),
    version: process.env.APP_VERSION ?? '0.1.0',
    openapiEnabled: process.env.OPENAPI_ENABLED === 'true',
    database: {
      url: process.env.DATABASE_URL ?? '',
      poolMin: Number(process.env.DATABASE_POOL_MIN),
      poolMax: Number(process.env.DATABASE_POOL_MAX),
      connectionTimeoutMs: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS),
      queryTimeoutMs: Number(process.env.DATABASE_QUERY_TIMEOUT_MS),
      healthTimeoutMs: Number(process.env.DATABASE_HEALTH_TIMEOUT_MS),
    },
  }),
);
