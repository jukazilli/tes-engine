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
  DATABASE_URL: string;
  DATABASE_POOL_MIN: number;
  DATABASE_POOL_MAX: number;
  DATABASE_CONNECTION_TIMEOUT_MS: number;
  DATABASE_QUERY_TIMEOUT_MS: number;
  DATABASE_HEALTH_TIMEOUT_MS: number;
}

export interface DatabaseConfig {
  url: string;
  poolMin: number;
  poolMax: number;
  connectionTimeoutMs: number;
  queryTimeoutMs: number;
  healthTimeoutMs: number;
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
  database: DatabaseConfig;
}
