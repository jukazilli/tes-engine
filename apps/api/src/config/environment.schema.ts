import Joi from 'joi';
import { ENVIRONMENTS, LOG_LEVELS, ApiEnvironment } from './environment.types';

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    throw new Error('OPENAPI_ENABLED must be a boolean string.');
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  throw new Error('OPENAPI_ENABLED must be true or false.');
}

function parseCorsOrigins(value: string): string[] {
  return value.split(',').map((origin) => {
    const trimmed = origin.trim();
    if (!trimmed) {
      throw new Error('CORS_ORIGINS contains an empty origin.');
    }

    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('invalid protocol');
      }
      return parsed.origin;
    } catch {
      throw new Error(`CORS_ORIGINS contains an invalid origin: ${trimmed}`);
    }
  });
}

export const environmentSchema = Joi.object<ApiEnvironment>({
  NODE_ENV: Joi.string()
    .valid(...ENVIRONMENTS)
    .required(),
  API_PORT: Joi.number().integer().min(1).max(65535).required(),
  API_PREFIX: Joi.string()
    .pattern(/^[a-z][a-z0-9-]*$/)
    .required(),
  LOG_LEVEL: Joi.string()
    .valid(...LOG_LEVELS)
    .required(),
  CORS_ORIGINS: Joi.string()
    .required()
    .custom((value: string) => {
      parseCorsOrigins(value);
      return value;
    }),
  APP_VERSION: Joi.string().min(1).required(),
  OPENAPI_ENABLED: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid('true', 'false', 'TRUE', 'FALSE'))
    .custom((value: unknown) => parseBoolean(value))
    .required(),
  APP_WEB_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  SESSION_COOKIE_NAME: Joi.string()
    .pattern(/^[A-Za-z0-9_-]+$/)
    .required(),
  SESSION_TTL_SECONDS: Joi.number().integer().min(300).max(604_800).required(),
  SESSION_SECURE_COOKIE: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid('true', 'false', 'TRUE', 'FALSE'))
    .custom((value: unknown) => parseBoolean(value))
    .required(),
  SESSION_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').required(),
  CSRF_HEADER_NAME: Joi.string().min(1).required(),
  EMAIL_VERIFICATION_TTL_SECONDS: Joi.number().integer().min(300).max(604_800).required(),
  PASSWORD_RESET_TTL_SECONDS: Joi.number().integer().min(300).max(86_400).required(),
  AUTH_LOGIN_LIMIT: Joi.number().integer().min(1).max(100).required(),
  AUTH_LOGIN_WINDOW_SECONDS: Joi.number().integer().min(60).max(86_400).required(),
  AUTH_EMAIL_LIMIT: Joi.number().integer().min(1).max(100).required(),
  AUTH_EMAIL_WINDOW_SECONDS: Joi.number().integer().min(60).max(86_400).required(),
  ORGANIZATION_INVITATION_TTL_SECONDS: Joi.number().integer().min(300).max(2_592_000).required(),
  ORGANIZATION_INVITATION_RESEND_LIMIT: Joi.number().integer().min(1).max(100).required(),
  ORGANIZATION_INVITATION_RESEND_WINDOW_SECONDS: Joi.number()
    .integer()
    .min(60)
    .max(86_400)
    .required(),
  ORGANIZATION_HEADER_NAME: Joi.string()
    .pattern(/^[A-Za-z0-9-]+$/)
    .required(),
  EMAIL_PROVIDER: Joi.string().valid('smtp', 'resend', 'fake').required(),
  EMAIL_FROM_NAME: Joi.string().min(1).required(),
  EMAIL_FROM_ADDRESS: Joi.string().email({ tlds: false }).required(),
  SMTP_HOST: Joi.when('EMAIL_PROVIDER', {
    is: 'smtp',
    then: Joi.string().hostname().required(),
    otherwise: Joi.string().allow('').optional(),
  }),
  SMTP_PORT: Joi.when('EMAIL_PROVIDER', {
    is: 'smtp',
    then: Joi.number().integer().min(1).max(65535).required(),
    otherwise: Joi.number().integer().min(1).max(65535).optional(),
  }),
  SMTP_SECURE: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid('true', 'false', 'TRUE', 'FALSE', ''))
    .custom((value: unknown) => (value === '' ? false : parseBoolean(value)))
    .required(),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASSWORD: Joi.string().allow('').optional(),
  RESEND_API_KEY: Joi.when('EMAIL_PROVIDER', {
    is: 'resend',
    then: Joi.string().min(1).required(),
    otherwise: Joi.string().allow('').optional(),
  }),
  RESEND_FROM_ADDRESS: Joi.when('EMAIL_PROVIDER', {
    is: 'resend',
    then: Joi.string().email({ tlds: false }).required(),
    otherwise: Joi.string().allow('').optional(),
  }),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  DATABASE_POOL_MIN: Joi.number().integer().min(0).max(20).required(),
  DATABASE_POOL_MAX: Joi.number().integer().min(1).max(50).required(),
  DATABASE_CONNECTION_TIMEOUT_MS: Joi.number().integer().min(100).max(60_000).required(),
  DATABASE_QUERY_TIMEOUT_MS: Joi.number().integer().min(100).max(60_000).required(),
  DATABASE_HEALTH_TIMEOUT_MS: Joi.number().integer().min(100).max(10_000).required(),
}).required();

export function validateEnvironment(input: Record<string, unknown>): ApiEnvironment {
  const { error, value } = environmentSchema.validate(input, {
    abortEarly: false,
    allowUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join('; ');
    throw new Error(`Invalid API environment configuration: ${details}`);
  }

  return {
    NODE_ENV: value.NODE_ENV,
    API_PORT: Number(value.API_PORT),
    API_PREFIX: value.API_PREFIX,
    LOG_LEVEL: value.LOG_LEVEL,
    CORS_ORIGINS: value.CORS_ORIGINS,
    APP_VERSION: value.APP_VERSION,
    OPENAPI_ENABLED: parseBoolean(value.OPENAPI_ENABLED),
    APP_WEB_URL: value.APP_WEB_URL,
    SESSION_COOKIE_NAME: value.SESSION_COOKIE_NAME,
    SESSION_TTL_SECONDS: Number(value.SESSION_TTL_SECONDS),
    SESSION_SECURE_COOKIE: parseBoolean(value.SESSION_SECURE_COOKIE),
    SESSION_SAME_SITE: value.SESSION_SAME_SITE,
    CSRF_HEADER_NAME: value.CSRF_HEADER_NAME,
    EMAIL_VERIFICATION_TTL_SECONDS: Number(value.EMAIL_VERIFICATION_TTL_SECONDS),
    PASSWORD_RESET_TTL_SECONDS: Number(value.PASSWORD_RESET_TTL_SECONDS),
    AUTH_LOGIN_LIMIT: Number(value.AUTH_LOGIN_LIMIT),
    AUTH_LOGIN_WINDOW_SECONDS: Number(value.AUTH_LOGIN_WINDOW_SECONDS),
    AUTH_EMAIL_LIMIT: Number(value.AUTH_EMAIL_LIMIT),
    AUTH_EMAIL_WINDOW_SECONDS: Number(value.AUTH_EMAIL_WINDOW_SECONDS),
    ORGANIZATION_INVITATION_TTL_SECONDS: Number(value.ORGANIZATION_INVITATION_TTL_SECONDS),
    ORGANIZATION_INVITATION_RESEND_LIMIT: Number(value.ORGANIZATION_INVITATION_RESEND_LIMIT),
    ORGANIZATION_INVITATION_RESEND_WINDOW_SECONDS: Number(
      value.ORGANIZATION_INVITATION_RESEND_WINDOW_SECONDS,
    ),
    ORGANIZATION_HEADER_NAME: value.ORGANIZATION_HEADER_NAME,
    EMAIL_PROVIDER: value.EMAIL_PROVIDER,
    EMAIL_FROM_NAME: value.EMAIL_FROM_NAME,
    EMAIL_FROM_ADDRESS: value.EMAIL_FROM_ADDRESS,
    SMTP_HOST: value.SMTP_HOST,
    SMTP_PORT: Number(value.SMTP_PORT),
    SMTP_SECURE: parseBoolean(value.SMTP_SECURE),
    SMTP_USER: value.SMTP_USER,
    SMTP_PASSWORD: value.SMTP_PASSWORD,
    RESEND_API_KEY: value.RESEND_API_KEY,
    RESEND_FROM_ADDRESS: value.RESEND_FROM_ADDRESS,
    DATABASE_URL: value.DATABASE_URL,
    DATABASE_POOL_MIN: Number(value.DATABASE_POOL_MIN),
    DATABASE_POOL_MAX: Number(value.DATABASE_POOL_MAX),
    DATABASE_CONNECTION_TIMEOUT_MS: Number(value.DATABASE_CONNECTION_TIMEOUT_MS),
    DATABASE_QUERY_TIMEOUT_MS: Number(value.DATABASE_QUERY_TIMEOUT_MS),
    DATABASE_HEALTH_TIMEOUT_MS: Number(value.DATABASE_HEALTH_TIMEOUT_MS),
  };
}

export function validateRuntimeEnvironment(input: Record<string, unknown>): ApiEnvironment {
  const value = validateEnvironment({ ...input, ...process.env });
  if (value.EMAIL_PROVIDER === 'fake' && !['test', 'development'].includes(value.NODE_ENV)) {
    throw new Error('Invalid API environment configuration: EMAIL_PROVIDER=fake is not allowed.');
  }
  return value;
}

export { parseCorsOrigins };
