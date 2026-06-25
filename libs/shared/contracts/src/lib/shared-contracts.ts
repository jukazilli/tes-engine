export interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
}

export interface LivenessResponse {
  status: 'alive';
  service: string;
  timestamp: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  configurationLoaded: boolean;
  applicationInitialized: boolean;
  database: {
    status: 'up' | 'down';
  };
}

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
  method: string;
  correlationId: string;
  fieldErrors?: Record<string, string[]>;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthRegisterResponse {
  userId: string;
  emailVerificationRequired: true;
}

export interface AuthVerifyEmailRequest {
  token: string;
}

export interface AuthVerifyEmailResponse {
  verified: true;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    status: string;
  };
}

export interface AuthMeResponse {
  id: string;
  email: string;
  displayName: string;
  status: string;
}

export interface AuthGenericMessageResponse {
  message: string;
}

export interface AuthResendVerificationRequest {
  email: string;
}

export interface AuthForgotPasswordRequest {
  email: string;
}

export interface AuthResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthCsrfResponse {
  csrfToken: string;
}

export interface AuthSessionResponse {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  current: boolean;
  userAgent?: string;
  status: string;
}
