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
    appWebUrl: process.env.APP_WEB_URL ?? 'http://localhost:4200',
    auth: {
      sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'tes_session',
      sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS),
      sessionSecureCookie: process.env.SESSION_SECURE_COOKIE === 'true',
      sessionSameSite: (process.env.SESSION_SAME_SITE ??
        'lax') as AppConfig['auth']['sessionSameSite'],
      csrfHeaderName: process.env.CSRF_HEADER_NAME ?? 'X-CSRF-Token',
      emailVerificationTtlSeconds: Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS),
      passwordResetTtlSeconds: Number(process.env.PASSWORD_RESET_TTL_SECONDS),
      loginLimit: Number(process.env.AUTH_LOGIN_LIMIT),
      loginWindowSeconds: Number(process.env.AUTH_LOGIN_WINDOW_SECONDS),
      emailLimit: Number(process.env.AUTH_EMAIL_LIMIT),
      emailWindowSeconds: Number(process.env.AUTH_EMAIL_WINDOW_SECONDS),
    },
    email: {
      provider: (process.env.EMAIL_PROVIDER ?? 'smtp') as AppConfig['email']['provider'],
      fromName: process.env.EMAIL_FROM_NAME ?? 'TES Engine',
      fromAddress: process.env.EMAIL_FROM_ADDRESS ?? '',
      smtpHost: process.env.SMTP_HOST ?? '',
      smtpPort: Number(process.env.SMTP_PORT),
      smtpSecure: process.env.SMTP_SECURE === 'true',
      smtpUser: process.env.SMTP_USER || undefined,
      smtpPassword: process.env.SMTP_PASSWORD || undefined,
      resendApiKey: process.env.RESEND_API_KEY || undefined,
      resendFromAddress: process.env.RESEND_FROM_ADDRESS || undefined,
    },
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
