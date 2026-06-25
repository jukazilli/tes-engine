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
  APP_WEB_URL: string;
  SESSION_COOKIE_NAME: string;
  SESSION_TTL_SECONDS: number;
  SESSION_SECURE_COOKIE: boolean;
  SESSION_SAME_SITE: 'lax' | 'strict' | 'none';
  CSRF_HEADER_NAME: string;
  EMAIL_VERIFICATION_TTL_SECONDS: number;
  PASSWORD_RESET_TTL_SECONDS: number;
  AUTH_LOGIN_LIMIT: number;
  AUTH_LOGIN_WINDOW_SECONDS: number;
  AUTH_EMAIL_LIMIT: number;
  AUTH_EMAIL_WINDOW_SECONDS: number;
  ORGANIZATION_INVITATION_TTL_SECONDS: number;
  ORGANIZATION_INVITATION_RESEND_LIMIT: number;
  ORGANIZATION_INVITATION_RESEND_WINDOW_SECONDS: number;
  ORGANIZATION_HEADER_NAME: string;
  EMAIL_PROVIDER: 'smtp' | 'resend' | 'fake';
  EMAIL_FROM_NAME: string;
  EMAIL_FROM_ADDRESS: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_ADDRESS?: string;
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
  appWebUrl: string;
  auth: AuthConfig;
  email: EmailConfig;
  organizations: OrganizationsConfig;
  database: DatabaseConfig;
}

export interface AuthConfig {
  sessionCookieName: string;
  sessionTtlSeconds: number;
  sessionSecureCookie: boolean;
  sessionSameSite: 'lax' | 'strict' | 'none';
  csrfHeaderName: string;
  emailVerificationTtlSeconds: number;
  passwordResetTtlSeconds: number;
  loginLimit: number;
  loginWindowSeconds: number;
  emailLimit: number;
  emailWindowSeconds: number;
}

export interface EmailConfig {
  provider: 'smtp' | 'resend' | 'fake';
  fromName: string;
  fromAddress: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  resendApiKey?: string;
  resendFromAddress?: string;
}

export interface OrganizationsConfig {
  invitationTtlSeconds: number;
  invitationResendLimit: number;
  invitationResendWindowSeconds: number;
  organizationHeaderName: string;
}
