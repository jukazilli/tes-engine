export const ENVIRONMENTS = ['development', 'test', 'staging', 'production'] as const;
export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export type EnvironmentName = (typeof ENVIRONMENTS)[number];
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface ApiEnvironment {
  NODE_ENV: EnvironmentName;
  API_PORT: number;
  API_PREFIX: string;
  LOG_LEVEL: LogLevel;
  CORS_ORIGINS: string;
  APP_VERSION: string;
  OPENAPI_ENABLED: boolean;
}

export interface AppConfig {
  serviceName: 'tes-engine-api';
  environment: EnvironmentName;
  port: number;
  prefix: string;
  logLevel: LogLevel;
  corsOrigins: string[];
  version: string;
  openapiEnabled: boolean;
}
