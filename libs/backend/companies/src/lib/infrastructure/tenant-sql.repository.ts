import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_POOL, DatabasePool } from '@tes-engine/backend/database';
import { PoolClient, QueryResult, QueryResultRow } from 'pg';

export interface TenantSqlContext {
  organizationId: string;
  userId?: string;
}

@Injectable()
export class TenantSqlRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: DatabasePool) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return await this.pool.query<T>(text, values);
  }

  async withTenantTransaction<T>(
    context: TenantSqlContext,
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.current_organization_id', $1, true)", [
        context.organizationId,
      ]);
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [
        context.userId ?? '',
      ]);
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
