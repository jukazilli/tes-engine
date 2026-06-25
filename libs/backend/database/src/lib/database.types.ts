import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export interface DatabaseOptions {
  url: string;
  poolMin: number;
  poolMax: number;
  connectionTimeoutMs: number;
  queryTimeoutMs: number;
  healthTimeoutMs: number;
}

export type DatabasePool = Pool;
export type TesDatabase = NodePgDatabase<typeof schema>;
