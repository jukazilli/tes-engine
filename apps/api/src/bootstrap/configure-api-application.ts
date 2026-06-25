import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import helmet from 'helmet';
import { PinoLogger } from 'nestjs-pino';
import { ApiExceptionFilter } from '../common/filters/api-exception.filter';
import { CORRELATION_ID_HEADER } from '../common/middleware/correlation-id.constants';
import { CorrelationIdService } from '../common/middleware/correlation-id.service';
import { createGlobalValidationPipe } from '../common/pipes/global-validation.pipe';
import { AppConfig } from '../config/environment.types';
import { setupOpenApi } from '../openapi/openapi.config';

interface MiddlewareRequest {
  headers: Record<string, string | string[] | undefined>;
  correlationId?: string;
}

interface MiddlewareResponse {
  setHeader(name: string, value: string): void;
}

type MiddlewareNext = () => void;

export async function configureApiApplication(
  app: INestApplication,
  appConfig: AppConfig,
): Promise<void> {
  const correlationIdService = app.get(CorrelationIdService);

  app.setGlobalPrefix(appConfig.prefix);
  app.enableShutdownHooks(['SIGTERM', 'SIGINT']);
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use((req: MiddlewareRequest, res: MiddlewareResponse, next: MiddlewareNext) => {
    const correlationId = correlationIdService.resolve(req.headers[CORRELATION_ID_HEADER]);
    req.correlationId = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.enableCors({
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (!origin || appConfig.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin is not allowed.'), false);
    },
    credentials: true,
  });
  app.useGlobalPipes(createGlobalValidationPipe());
  app.useGlobalFilters(
    new ApiExceptionFilter(app.get(HttpAdapterHost), await app.resolve(PinoLogger)),
  );
  setupOpenApi(app, appConfig);
}
