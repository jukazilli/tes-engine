import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class AuthRateLimitService {
  private readonly buckets = new Map<string, RateLimitBucket>();

  consume(input: { key: string; limit: number; windowSeconds: number }): void {
    const now = Date.now();
    const resetAt = now + input.windowSeconds * 1000;
    const bucket = this.buckets.get(input.key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(input.key, { count: 1, resetAt });
      return;
    }

    bucket.count += 1;
    if (bucket.count > input.limit) {
      throw new HttpException('Too many authentication attempts.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
