import { Injectable } from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

@Injectable()
export class TokenService {
  createOpaqueToken(): string {
    return randomBytes(32).toString('base64url');
  }

  digestToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  secureCompareDigest(actual: string, expected: string): boolean {
    const actualBuffer = Buffer.from(actual, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    return (
      actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
    );
  }
}
