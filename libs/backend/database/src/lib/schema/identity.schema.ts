import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
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

export const userCredentials = appSchema.table(
  'user_credentials',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    passwordHash: text('password_hash').notNull(),
    passwordChangedAt: timestamp('password_changed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    failedAttempts: integer('failed_attempts').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    version: integer('version').notNull().default(1),
  },
  (table) => [
    check('user_credentials_failed_attempts_check', sql`${table.failedAttempts} >= 0`),
    check('user_credentials_version_check', sql`${table.version} >= 1`),
    uniqueIndex('user_credentials_user_id_uidx').on(table.userId),
  ],
);

export const emailVerificationTokens = appSchema.table(
  'email_verification_tokens',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    tokenDigest: text('token_digest').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    version: integer('version').notNull().default(1),
    emailSent: boolean('email_sent').notNull().default(false),
  },
  (table) => [
    check('email_verification_tokens_version_check', sql`${table.version} >= 1`),
    uniqueIndex('email_verification_tokens_digest_uidx').on(table.tokenDigest),
    index('email_verification_tokens_user_id_idx').on(table.userId),
    index('email_verification_tokens_expires_at_idx').on(table.expiresAt),
  ],
);

export const passwordResetTokens = appSchema.table(
  'password_reset_tokens',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    requestedIpHash: text('requested_ip_hash'),
  },
  (table) => [
    uniqueIndex('password_reset_tokens_hash_uidx').on(table.tokenHash),
    index('password_reset_tokens_user_id_idx').on(table.userId),
    index('password_reset_tokens_expires_at_idx').on(table.expiresAt),
  ],
);

export const userSessions = appSchema.table(
  'user_sessions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    tokenHash: text('token_hash').notNull(),
    csrfTokenHash: text('csrf_token_hash').notNull(),
    status: text('status').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedReason: text('revoked_reason'),
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
    version: integer('version').notNull().default(1),
  },
  (table) => [
    check('user_sessions_status_check', sql`${table.status} in ('ACTIVE','REVOKED','EXPIRED')`),
    check('user_sessions_version_check', sql`${table.version} >= 1`),
    uniqueIndex('user_sessions_token_hash_uidx').on(table.tokenHash),
    index('user_sessions_user_id_idx').on(table.userId),
    index('user_sessions_expires_at_idx').on(table.expiresAt),
    index('user_sessions_status_idx').on(table.status),
  ],
);

export const loginAttempts = appSchema.table(
  'login_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }),
    emailFingerprint: text('email_fingerprint').notNull(),
    ipFingerprint: text('ip_fingerprint'),
    successful: boolean('successful').notNull(),
    failureReason: text('failure_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('login_attempts_email_created_at_idx').on(table.emailFingerprint, table.createdAt),
    index('login_attempts_ip_created_at_idx').on(table.ipFingerprint, table.createdAt),
  ],
);

export const emailDeliveryEvents = appSchema.table(
  'email_delivery_events',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }),
    messageType: text('message_type').notNull(),
    provider: text('provider').notNull(),
    providerMessageId: text('provider_message_id'),
    recipientFingerprint: text('recipient_fingerprint').notNull(),
    status: text('status').notNull(),
    errorCode: text('error_code'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('email_delivery_events_user_id_idx').on(table.userId),
    index('email_delivery_events_created_at_idx').on(table.createdAt),
    index('email_delivery_events_recipient_idx').on(table.recipientFingerprint),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  credential: one(userCredentials, {
    fields: [users.id],
    references: [userCredentials.userId],
  }),
  emailVerificationTokens: many(emailVerificationTokens),
}));

export const userCredentialsRelations = relations(userCredentials, ({ one }) => ({
  user: one(users, {
    fields: [userCredentials.userId],
    references: [users.id],
  }),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationTokens.userId],
    references: [users.id],
  }),
}));
