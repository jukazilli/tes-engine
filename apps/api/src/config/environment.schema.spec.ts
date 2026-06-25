import { parseCorsOrigins, validateEnvironment } from './environment.schema';

const validEnvironment = {
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
};

describe('environment schema', () => {
  it('parses a typed API environment', () => {
    expect(validateEnvironment(validEnvironment)).toEqual({
      NODE_ENV: 'test',
      API_PORT: 3000,
      API_PREFIX: 'api',
      LOG_LEVEL: 'silent',
      CORS_ORIGINS: 'http://localhost:4200,http://localhost:4300',
      APP_VERSION: '0.1.0',
      OPENAPI_ENABLED: true,
      DATABASE_URL: 'postgresql://tes_engine_app:change-me@127.0.0.1:15432/tes_engine',
      DATABASE_POOL_MIN: 0,
      DATABASE_POOL_MAX: 5,
      DATABASE_CONNECTION_TIMEOUT_MS: 1000,
      DATABASE_QUERY_TIMEOUT_MS: 2000,
      DATABASE_HEALTH_TIMEOUT_MS: 1000,
    });
  });

  it('rejects invalid API_PORT values', () => {
    expect(() => validateEnvironment({ ...validEnvironment, API_PORT: 'abc' })).toThrow(
      /Invalid API environment configuration/,
    );
  });

  it('rejects invalid NODE_ENV values', () => {
    expect(() => validateEnvironment({ ...validEnvironment, NODE_ENV: 'local' })).toThrow(
      /Invalid API environment configuration/,
    );
  });

  it('rejects malformed CORS origins', () => {
    expect(() => parseCorsOrigins('http://localhost:4200,not-a-url')).toThrow(/invalid origin/);
  });
});
