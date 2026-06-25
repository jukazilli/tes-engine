export const API_ERROR_CODES = {
  validation: 'VALIDATION_ERROR',
  notFound: 'RESOURCE_NOT_FOUND',
  methodNotAllowed: 'METHOD_NOT_ALLOWED',
  internal: 'INTERNAL_SERVER_ERROR',
  configuration: 'CONFIGURATION_ERROR',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
