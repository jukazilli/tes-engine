import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DATABASE } from '../database.constants';
import { TesDatabase } from '../database.types';
import { assertValidTenantContext, TenantContext } from './tenant-context';

type TransactionCallback = Parameters<TesDatabase['transaction']>[0];
type TenantTransaction = Parameters<TransactionCallback>[0];

@Injectable()
export class TenantTransactionService {
  constructor(@Inject(DATABASE) private readonly database: TesDatabase) {}

  async withTenantTransaction<T>(
    context: TenantContext,
    callback: (tx: TenantTransaction) => Promise<T>,
  ): Promise<T> {
    assertValidTenantContext(context);

    return this.database.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.current_organization_id', ${context.organizationId}, true)`,
      );
      await tx.execute(
        sql`select set_config('app.current_user_id', ${context.userId ?? ''}, true)`,
      );

      return callback(tx);
    });
  }
}
