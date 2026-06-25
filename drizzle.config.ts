import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './libs/backend/database/src/lib/schema/index.ts',
  out: './infrastructure/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_MIGRATION_URL ?? '',
  },
  strict: true,
  verbose: true,
});
