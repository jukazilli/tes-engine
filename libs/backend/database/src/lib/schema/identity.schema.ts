import { sql } from 'drizzle-orm';
import { check, index, integer, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { appSchema } from './app.schema';
import { userStatuses } from './enums.schema';

export const users = appSchema.table(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text('email').notNull(),
    displayName: text('display_name').notNull(),
    status: text('status').notNull().default('PENDING_VERIFICATION'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    version: integer('version').notNull().default(1),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    check(
      'users_status_check',
      sql`${table.status} in ${sql.raw(`('${userStatuses.join("','")}')`)}`,
    ),
    check('users_version_check', sql`${table.version} >= 1`),
    index('users_status_idx').on(table.status),
    uniqueIndex('users_email_active_ci_uidx')
      .on(sql`lower(${table.email})`)
      .where(sql`${table.deletedAt} is null`),
  ],
);
