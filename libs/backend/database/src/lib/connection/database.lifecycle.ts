import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { DATABASE_POOL } from '../database.constants';
import { DatabasePool } from '../database.types';

@Injectable()
export class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_POOL) private readonly pool: DatabasePool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
