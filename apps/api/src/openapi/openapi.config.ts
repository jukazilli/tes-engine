import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CORRELATION_ID_HEADER } from '../common/middleware/correlation-id.constants';
import { AppConfig } from '../config/environment.types';
import { HealthResponseDto } from '../health/dto/health-response.dto';
import { LivenessResponseDto } from '../health/dto/liveness-response.dto';
import { ReadinessResponseDto } from '../health/dto/readiness-response.dto';
import { ApiErrorResponseDto } from './api-error-response.dto';

export function setupOpenApi(app: INestApplication, config: AppConfig): void {
  if (!config.openapiEnabled) {
    return;
  }

  const openapiConfig = new DocumentBuilder()
    .setTitle('TES Engine API')
    .setDescription('Technical foundation API for TES Engine.')
    .setVersion(config.version)
    .addTag('Health')
    .addGlobalParameters({
      in: 'header',
      name: CORRELATION_ID_HEADER,
      required: false,
      schema: {
        type: 'string',
        maxLength: 128,
      },
      description: 'Correlation identifier echoed by the API.',
    })
    .build();

  const document = SwaggerModule.createDocument(app, openapiConfig, {
    extraModels: [
      ApiErrorResponseDto,
      HealthResponseDto,
      LivenessResponseDto,
      ReadinessResponseDto,
    ],
  });

  SwaggerModule.setup(`${config.prefix}/docs`, app, document, {
    jsonDocumentUrl: `${config.prefix}/docs-json`,
    swaggerOptions: {
      persistAuthorization: false,
    },
  });
}
