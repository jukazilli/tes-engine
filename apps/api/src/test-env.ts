export function setApiTestEnvironment(overrides: Record<string, string> = {}): void {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    API_PORT: '3000',
    API_PREFIX: 'api',
    LOG_LEVEL: 'silent',
    CORS_ORIGINS: 'http://localhost:4200,http://localhost:4300',
    APP_VERSION: '0.1.0',
    OPENAPI_ENABLED: 'true',
    ...overrides,
  });
}
