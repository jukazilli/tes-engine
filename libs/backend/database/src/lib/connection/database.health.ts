import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_OPTIONS, DATABASE_POOL } from '../database.constants';
import { DatabaseOptions, DatabasePool } from '../database.types';

export interface DatabaseHealthResult {
  status: 'up' | 'down';
}

@Injectable()
export class DatabaseHealthService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: DatabasePool,
    @Inject(DATABASE_OPTIONS) private readonly options: DatabaseOptions,
  ) {}

  async check(): Promise<DatabaseHealthResult> {
    try {
      await Promise.race([
        this.pool.query('select 1 as ok'),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Database health timeout')),
            this.options.healthTimeoutMs,
          ),
        ),
      ]);
      return { status: 'up' };
    } catch {
      return { status: 'down' };
    }
  }
}
