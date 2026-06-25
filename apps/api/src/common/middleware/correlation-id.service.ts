import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CORRELATION_ID_MAX_LENGTH, CORRELATION_ID_PATTERN } from './correlation-id.constants';

@Injectable()
export class CorrelationIdService {
  resolve(value: unknown): string {
    const candidate = Array.isArray(value) ? value[0] : value;

    if (
      typeof candidate === 'string' &&
      candidate.length > 0 &&
      candidate.length <= CORRELATION_ID_MAX_LENGTH &&
      CORRELATION_ID_PATTERN.test(candidate)
    ) {
      return candidate;
    }

    return randomUUID();
  }
}
