import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';
import { ApiErrorResponse } from '@tes-engine/shared/contracts';
import { API_ERROR_CODES } from '../errors/api-error-code';
import { RequestWithCorrelationId } from '../middleware/correlation-id.middleware';

interface ApiHttpRequest extends RequestWithCorrelationId {
  originalUrl?: string;
  url: string;
  method: string;
}

interface ApiHttpResponse {
  type(value: string): void;
}

interface ValidationErrorMessage {
  property?: string;
  constraints?: Record<string, string>;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ApiExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<ApiHttpRequest>();
    const response = ctx.getResponse<ApiHttpResponse>();
    const statusCode = this.getStatusCode(exception);
    const body = this.buildErrorResponse(exception, request, statusCode);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        {
          err: exception,
          correlationId: body.correlationId,
          method: body.method,
          path: body.path,
          statusCode,
        },
        'Unhandled API exception',
      );
    }

    const { httpAdapter } = this.httpAdapterHost;
    response.type('application/json');
    httpAdapter.reply(response, body, statusCode);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private buildErrorResponse(
    exception: unknown,
    request: ApiHttpRequest,
    statusCode: number,
  ): ApiErrorResponse {
    const correlationId =
      (request as RequestWithCorrelationId).correlationId ??
      request.headers['x-correlation-id']?.toString() ??
      '';

    return {
      statusCode,
      code: this.resolveCode(exception, statusCode),
      message: this.resolveMessage(exception, statusCode),
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
      method: request.method,
      correlationId,
      fieldErrors: this.extractFieldErrors(exception),
    };
  }

  private resolveCode(exception: unknown, statusCode: number): string {
    if (exception instanceof BadRequestException && this.extractFieldErrors(exception)) {
      return API_ERROR_CODES.validation;
    }

    if (statusCode === HttpStatus.NOT_FOUND) {
      return API_ERROR_CODES.notFound;
    }

    if (statusCode === HttpStatus.METHOD_NOT_ALLOWED) {
      return API_ERROR_CODES.methodNotAllowed;
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return API_ERROR_CODES.internal;
    }

    return `HTTP_${statusCode}`;
  }

  private resolveMessage(exception: unknown, statusCode: number): string {
    if (exception instanceof BadRequestException && this.extractFieldErrors(exception)) {
      return 'Request validation failed.';
    }

    if (statusCode === HttpStatus.NOT_FOUND) {
      return 'Resource not found.';
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Internal server error.';
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response && 'message' in response) {
        const message = (response as { message: unknown }).message;
        return Array.isArray(message) ? message.join('; ') : String(message);
      }

      return exception.message;
    }

    return 'Internal server error.';
  }

  private extractFieldErrors(exception: unknown): Record<string, string[]> | undefined {
    if (!(exception instanceof BadRequestException)) {
      return undefined;
    }

    const response = exception.getResponse();
    if (typeof response !== 'object' || response === null || !('message' in response)) {
      return undefined;
    }

    const messages = (response as { message: unknown }).message;
    if (!Array.isArray(messages)) {
      return undefined;
    }

    const fieldErrors: Record<string, string[]> = {};
    for (const message of messages) {
      if (typeof message === 'string') {
        const forbiddenProperty = /^property\s+(\S+)\s+should not exist$/.exec(message);
        const property = forbiddenProperty?.[1] ?? message.split(' ')[0] ?? 'request';
        fieldErrors[property] = [...(fieldErrors[property] ?? []), message];
        continue;
      }

      const validationMessage = message as ValidationErrorMessage;
      if (validationMessage.property && validationMessage.constraints) {
        fieldErrors[validationMessage.property] = Object.values(validationMessage.constraints);
      }
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
  }
}
