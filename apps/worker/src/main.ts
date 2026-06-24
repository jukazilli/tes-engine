import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppService } from './app/app.service';

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(AppModule);
  const status = context.get(AppService).getBootstrapStatus();

  Logger.log(JSON.stringify(status));
  await context.close();
}

bootstrap();
