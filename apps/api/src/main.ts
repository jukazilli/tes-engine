import { NestFactory } from '@nestjs/core';
import { Logger, PinoLogger } from 'nestjs-pino';
import { AppModule } from './app/app.module';
import { configureApiApplication } from './bootstrap/configure-api-application';
import { AppConfigService } from './config/app-config.service';
import { HealthService } from './health/health.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const appConfig = app.get(AppConfigService).value;

  app.useLogger(app.get(Logger));
  await configureApiApplication(app, appConfig);

  await app.init();
  app.get(HealthService).markInitialized();
  await app.listen(appConfig.port);
  const logger = await app.resolve(PinoLogger);
  logger.info(
    {
      service: appConfig.serviceName,
      environment: appConfig.environment,
      port: appConfig.port,
      prefix: appConfig.prefix,
    },
    'API started',
  );
}

void bootstrap();
