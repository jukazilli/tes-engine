import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class OrganizationRateLimitService {
  private readonly buckets = new Map<string, RateLimitBucket>();

  consume(input: { key: string; limit: number; windowSeconds: number }): void {
    const now = Date.now();
    const bucket = this.buckets.get(input.key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(input.key, {
        count: 1,
        resetAt: now + input.windowSeconds * 1000,
      });
      return;
    }
    bucket.count += 1;
    if (bucket.count > input.limit) {
      throw new HttpException('ORGANIZATION_RATE_LIMITED', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
