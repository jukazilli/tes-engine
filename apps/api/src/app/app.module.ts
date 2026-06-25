import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { createLoggerParams } from '../common/logging/logging.config';
import { CorrelationIdService } from '../common/middleware/correlation-id.service';
import { appConfig } from '../config/app-config';
import { validateRuntimeEnvironment } from '../config/environment.schema';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '.env.example'],
      load: [appConfig],
      validate: validateRuntimeEnvironment,
    }),
    LoggerModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: createLoggerParams,
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [CorrelationIdService],
})
export class AppModule {}
