import { Injectable, NestMiddleware } from '@nestjs/common';
import { CORRELATION_ID_HEADER } from './correlation-id.constants';
import { CorrelationIdService } from './correlation-id.service';

type NextFunction = () => void;

interface HeaderResponse {
  setHeader(name: string, value: string): void;
}

export interface RequestWithCorrelationId {
  headers: Record<string, string | string[] | undefined>;
  correlationId?: string;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly correlationIdService: CorrelationIdService) {}

  use(req: RequestWithCorrelationId, res: HeaderResponse, next: NextFunction): void {
    const correlationId = this.correlationIdService.resolve(req.headers[CORRELATION_ID_HEADER]);
    req.correlationId = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
