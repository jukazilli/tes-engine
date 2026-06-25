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
  }),
);
