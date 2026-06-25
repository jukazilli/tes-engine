import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

export function createGlobalValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: false,
    },
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        message: flattenValidationErrors(errors),
      }),
  });
}

export function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    if (error.children?.length) {
      messages.push(...flattenValidationErrors(error.children));
    }
  }

  return messages;
}
