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
  status: 'ready';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  configurationLoaded: boolean;
  applicationInitialized: boolean;
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
