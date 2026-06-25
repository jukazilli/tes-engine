import { relations, sql } from 'drizzle-orm';
import { check, index, integer, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './identity.schema';
import { membershipStatuses, organizationStatuses } from './enums.schema';
import { appSchema } from './app.schema';

export const organizations = appSchema.table(
  'organizations',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    status: text('status').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    version: integer('version').notNull().default(1),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    check(
      'organizations_status_check',
      sql`${table.status} in ${sql.raw(`('${organizationStatuses.join("','")}')`)}`,
    ),
    check('organizations_version_check', sql`${table.version} >= 1`),
    index('organizations_status_idx').on(table.status),
    uniqueIndex('organizations_slug_active_ci_uidx')
      .on(sql`lower(${table.slug})`)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export const organizationMemberships = appSchema.table(
  'organization_memberships',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    status: text('status').notNull().default('INVITED'),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    version: integer('version').notNull().default(1),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    check(
      'organization_memberships_status_check',
      sql`${table.status} in ${sql.raw(`('${membershipStatuses.join("','")}')`)}`,
    ),
    check('organization_memberships_version_check', sql`${table.version} >= 1`),
    index('organization_memberships_organization_id_idx').on(table.organizationId),
    index('organization_memberships_user_id_idx').on(table.userId),
    uniqueIndex('organization_memberships_active_uidx')
      .on(table.organizationId, table.userId)
      .where(
        sql`${table.deletedAt} is null and ${table.status} in ('INVITED', 'ACTIVE', 'SUSPENDED')`,
      ),
  ],
);

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(organizationMemberships),
}));

export const organizationMembershipsRelations = relations(organizationMemberships, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMemberships.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMemberships.userId],
    references: [users.id],
  }),
}));
