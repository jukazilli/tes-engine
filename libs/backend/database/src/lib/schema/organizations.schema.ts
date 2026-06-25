import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
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

export const roles = appSchema.table(
  'roles',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    roleType: text('role_type').notNull().default('SYSTEM'),
    isAssignable: boolean('is_assignable').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    version: integer('version').notNull().default(1),
  },
  (table) => [
    check('roles_role_type_check', sql`${table.roleType} in ('SYSTEM')`),
    check('roles_version_check', sql`${table.version} >= 1`),
    uniqueIndex('roles_code_ci_uidx').on(sql`lower(${table.code})`),
  ],
);

export const permissions = appSchema.table(
  'permissions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('permissions_no_wildcard_check', sql`${table.code} <> '*'`),
    uniqueIndex('permissions_code_uidx').on(table.code),
  ],
);

export const rolePermissions = appSchema.table(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('role_permissions_uidx').on(table.roleId, table.permissionId)],
);

export const membershipRoles = appSchema.table(
  'membership_roles',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    membershipId: uuid('membership_id')
      .notNull()
      .references(() => organizationMemberships.id, { onDelete: 'restrict' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    assignedByUserId: uuid('assigned_by_user_id').references(() => users.id, {
      onDelete: 'restrict',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('membership_roles_membership_id_idx').on(table.membershipId),
    index('membership_roles_organization_id_idx').on(table.organizationId),
    uniqueIndex('membership_roles_active_uidx')
      .on(table.membershipId, table.roleId)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export const organizationInvitations = appSchema.table(
  'organization_invitations',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    invitedEmail: text('invited_email').notNull(),
    invitedEmailNormalized: text('invited_email_normalized').notNull(),
    tokenHash: text('token_hash').notNull(),
    status: text('status').notNull().default('PENDING'),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    acceptedByUserId: uuid('accepted_by_user_id').references(() => users.id, {
      onDelete: 'restrict',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSentAt: timestamp('last_sent_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    resendCount: integer('resend_count').notNull().default(0),
    version: integer('version').notNull().default(1),
  },
  (table) => [
    check(
      'organization_invitations_status_check',
      sql`${table.status} in ('PENDING','ACCEPTED','EXPIRED','REVOKED')`,
    ),
    check('organization_invitations_resend_count_check', sql`${table.resendCount} >= 0`),
    check('organization_invitations_version_check', sql`${table.version} >= 1`),
    uniqueIndex('organization_invitations_token_hash_uidx').on(table.tokenHash),
    uniqueIndex('organization_invitations_pending_email_uidx')
      .on(table.organizationId, table.invitedEmailNormalized)
      .where(sql`${table.status} = 'PENDING'`),
    index('organization_invitations_organization_id_idx').on(table.organizationId),
    index('organization_invitations_expires_at_idx').on(table.expiresAt),
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
