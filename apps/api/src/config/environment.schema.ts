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
  };
}

export function validateRuntimeEnvironment(input: Record<string, unknown>): ApiEnvironment {
  return validateEnvironment({ ...input, ...process.env });
}

export { parseCorsOrigins };
