import { Params } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { AppConfig } from '../../config/environment.types';
import { CORRELATION_ID_HEADER } from '../middleware/correlation-id.constants';

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers.set-cookie',
  'authorization',
  'cookie',
  'set-cookie',
  '*.password',
  '*.currentPassword',
  '*.newPassword',
  '*.token',
  '*.sessionToken',
  '*.csrfToken',
  '*.accessToken',
  '*.refreshToken',
  '*.secret',
  '*.resendApiKey',
  '*.smtpPassword',
  '*.clientSecret',
  '*.xml',
  '*.xmlContent',
  '*.fileContent',
];

export function createLoggerParams(config: AppConfig): Params {
  return {
    pinoHttp: {
      level: config.logLevel,
      genReqId: (req, res) => {
        const headerValue = req.headers[CORRELATION_ID_HEADER];
        const requestId = Array.isArray(headerValue) ? headerValue[0] : headerValue;
        const correlationId =
          typeof requestId === 'string' && requestId.length > 0 ? requestId : randomUUID();
        res.setHeader(CORRELATION_ID_HEADER, correlationId);
        return correlationId;
      },
      customProps: () => ({
        service: config.serviceName,
        environment: config.environment,
      }),
      customAttributeKeys: {
        reqId: 'correlationId',
      },
      redact: {
        paths: redactPaths,
        censor: '[REDACTED]',
      },
      transport:
        config.environment === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: true,
              },
            }
          : undefined,
    },
  };
}

export { redactPaths };
