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

export interface PageResponse<T> {
  items: T[];
  nextCursor?: string;
}

export interface ReferenceOption {
  code: string;
  label: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, string | number | boolean | null>;
}

export type FieldControlType = 'SELECT' | 'COMBO' | 'INPUT' | 'ACTION';

export interface ControlledFieldContract {
  screen: string;
  field: string;
  technicalCode: string;
  domainType: string;
  controlType: FieldControlType;
  optionsSource: string;
  required: boolean;
  editable: boolean;
  mask?: string;
  maxLength?: number;
  validation: string;
  persistedValue: string;
  displayLabel: string;
  helpText?: string;
}

export interface FiscalProfileFormOptions {
  taxRegimes: ReferenceOption[];
  nfeCrtOptions: ReferenceOption[];
  icmsTaxpayerIndicators: ReferenceOption[];
  sourceTypes: ReferenceOption[];
}

export interface PoSelectOptionLike {
  label: string;
  value: string;
}

export function toPoSelectOptions(options: ReferenceOption[]): PoSelectOptionLike[] {
  return options.map((option) => ({ label: option.label, value: option.code }));
}
