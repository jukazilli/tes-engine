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
