export function setApiTestEnvironment(overrides: Record<string, string> = {}): void {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    API_PORT: '3000',
    API_PREFIX: 'api',
    LOG_LEVEL: 'silent',
    CORS_ORIGINS: 'http://localhost:4200,http://localhost:4300',
    APP_VERSION: '0.1.0',
    OPENAPI_ENABLED: 'true',
    DATABASE_URL: 'postgresql://tes_engine_app:change-me@127.0.0.1:15432/tes_engine',
    DATABASE_POOL_MIN: '0',
    DATABASE_POOL_MAX: '5',
    DATABASE_CONNECTION_TIMEOUT_MS: '1000',
    DATABASE_QUERY_TIMEOUT_MS: '2000',
    DATABASE_HEALTH_TIMEOUT_MS: '1000',
    ...overrides,
  });
}
