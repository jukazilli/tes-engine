import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const workspaceRoot = process.cwd();
const migrationsDir = path.join(workspaceRoot, 'infrastructure', 'database', 'migrations');
const identifierPattern = /^[a-z_][a-z0-9_]*$/;

export function loadLocalEnvironment() {
  const initialKeys = new Set(Object.keys(process.env));
  const sources = new Map();

  for (const file of ['.env.example', '.env', '.env.local']) {
    const fullPath = path.join(workspaceRoot, file);
    if (!existsSync(fullPath)) {
      continue;
    }

    const content = readFileSync(fullPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        continue;
      }

      const index = trimmed.indexOf('=');
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!initialKeys.has(key)) {
        process.env[key] = value;
        sources.set(key, file);
      }
    }
  }

  const host = process.env.POSTGRES_HOST === 'localhost' ? '127.0.0.1' : process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT;
  const database = process.env.POSTGRES_DB;
  const migrationUser = process.env.POSTGRES_USER;
  const migrationPassword = process.env.POSTGRES_PASSWORD;
  const appUser = process.env.POSTGRES_APP_USER;
  const appPassword = process.env.POSTGRES_APP_PASSWORD;

  if (
    host &&
    port &&
    database &&
    migrationUser &&
    migrationPassword &&
    (!process.env.DATABASE_MIGRATION_URL ||
      sources.get('DATABASE_MIGRATION_URL') === '.env.example')
  ) {
    process.env.DATABASE_MIGRATION_URL = `postgresql://${encodeURIComponent(migrationUser)}:${encodeURIComponent(migrationPassword)}@${host}:${port}/${encodeURIComponent(database)}`;
  }

  if (
    host &&
    port &&
    database &&
    appUser &&
    appPassword &&
    (!process.env.DATABASE_URL || sources.get('DATABASE_URL') === '.env.example')
  ) {
    process.env.DATABASE_URL = `postgresql://${encodeURIComponent(appUser)}:${encodeURIComponent(appPassword)}@${host}:${port}/${encodeURIComponent(database)}`;
  }

  if (process.env.DATABASE_URL && appUser && appPassword) {
    const parsed = new URL(process.env.DATABASE_URL);
    if (parsed.username !== encodeURIComponent(appUser)) {
      parsed.username = encodeURIComponent(appUser);
      parsed.password = encodeURIComponent(appPassword);
      process.env.DATABASE_URL = parsed.toString();
    }
  }

  for (const key of ['DATABASE_MIGRATION_URL', 'DATABASE_URL']) {
    if (process.env[key]) {
      process.env[key] = process.env[key].replace('@localhost:', '@127.0.0.1:');
    }
  }
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

export function requireIdentifier(name, value) {
  if (!identifierPattern.test(value)) {
    throw new Error(`${name} must be a lowercase PostgreSQL identifier.`);
  }
  return value;
}

export function createMigrationPool() {
  return new pg.Pool({ connectionString: requireEnv('DATABASE_MIGRATION_URL'), max: 1 });
}

export function createRuntimePool() {
  return new pg.Pool({ connectionString: requireEnv('DATABASE_URL'), max: 2 });
}

export function migrationFiles() {
  return readdirSync(migrationsDir)
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort()
    .map((filename) => {
      const fullPath = path.join(migrationsDir, filename);
      const sql = readFileSync(fullPath, 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      return { filename, sql, checksum };
    });
}

export async function ensureMigrationTable(pool) {
  await pool.query('CREATE SCHEMA IF NOT EXISTS app_private');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_private.schema_migrations (
      filename text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function appliedMigrations(pool) {
  await ensureMigrationTable(pool);
  const result = await pool.query(
    'SELECT filename, checksum, applied_at FROM app_private.schema_migrations ORDER BY filename',
  );
  return new Map(result.rows.map((row) => [row.filename, row]));
}

export async function grantRuntimeRole(pool) {
  const appUser = requireIdentifier('POSTGRES_APP_USER', requireEnv('POSTGRES_APP_USER'));
  const appPassword = requireEnv('POSTGRES_APP_PASSWORD');

  const roleExists = await pool.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [appUser]);
  const roleSql = await pool.query(
    roleExists.rowCount === 0
      ? "SELECT format('CREATE ROLE %I LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS', $1::text, $2::text) AS sql"
      : "SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS', $1::text, $2::text) AS sql",
    [appUser, appPassword],
  );
  await pool.query(roleSql.rows[0].sql);

  const grants = await pool.query(
    `
    SELECT array[
      format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), $1::text),
      format('GRANT USAGE ON SCHEMA app TO %I', $1::text),
      format('GRANT USAGE ON SCHEMA app_private TO %I', $1::text),
      format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO %I', $1::text),
      format('GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA app TO %I', $1::text),
      format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_private TO %I', $1::text),
      format('ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', $1::text),
      format('ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO %I', $1::text),
      format('ALTER DEFAULT PRIVILEGES IN SCHEMA app_private GRANT EXECUTE ON FUNCTIONS TO %I', $1::text)
    ] AS statements
    `,
    [appUser],
  );

  for (const statement of grants.rows[0].statements) {
    try {
      await pool.query(statement);
    } catch (error) {
      if (!String(error.message).includes('does not exist')) {
        throw error;
      }
    }
  }

  const rbacCatalogRevokes = await pool.query(
    `
    SELECT array[
      format('REVOKE INSERT, UPDATE, DELETE ON app.roles FROM %I', $1::text),
      format('REVOKE INSERT, UPDATE, DELETE ON app.permissions FROM %I', $1::text),
      format('REVOKE INSERT, UPDATE, DELETE ON app.role_permissions FROM %I', $1::text)
    ] AS statements
    `,
    [appUser],
  );

  for (const statement of rbacCatalogRevokes.rows[0].statements) {
    try {
      await pool.query(statement);
    } catch (error) {
      if (!String(error.message).includes('does not exist')) {
        throw error;
      }
    }
  }
}

export async function runMain(main) {
  loadLocalEnvironment();
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
