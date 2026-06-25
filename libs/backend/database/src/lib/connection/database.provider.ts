import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE, DATABASE_OPTIONS, DATABASE_POOL } from '../database.constants';
import { DatabaseOptions, DatabasePool, TesDatabase } from '../database.types';
import * as schema from '../schema';

export const databasePoolProvider: Provider<DatabasePool> = {
  provide: DATABASE_POOL,
  useFactory: (options: DatabaseOptions) => {
    const pool = new Pool({
      connectionString: options.url,
      min: options.poolMin,
      max: options.poolMax,
      connectionTimeoutMillis: options.connectionTimeoutMs,
      query_timeout: options.queryTimeoutMs,
    });

    pool.on('error', () => {
      // Readiness reports the database state; idle client errors must not terminate the API process.
    });

    return pool;
  },
  inject: [DATABASE_OPTIONS],
};

export const databaseProvider: Provider<TesDatabase> = {
  provide: DATABASE,
  useFactory: (pool: Pool) => drizzle(pool, { schema }),
  inject: [DATABASE_POOL],
};
