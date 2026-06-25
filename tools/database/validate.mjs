import { createMigrationPool, requireEnv, requireIdentifier, runMain } from './database-utils.mjs';

await runMain(async () => {
  const pool = createMigrationPool();
  try {
    const appUser = requireIdentifier('POSTGRES_APP_USER', requireEnv('POSTGRES_APP_USER'));
    const tables = await pool.query(`
      SELECT n.nspname AS schemaname,
        c.relname AS tablename,
        c.relrowsecurity AS rowsecurity,
        c.relforcerowsecurity AS force_row_security
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'app' AND c.relkind = 'r'
      ORDER BY c.relname
    `);
    const byName = new Map(tables.rows.map((row) => [row.tablename, row]));
    for (const table of [
      'users',
      'organizations',
      'organization_memberships',
      'user_credentials',
      'email_verification_tokens',
      'password_reset_tokens',
      'user_sessions',
      'login_attempts',
      'email_delivery_events',
    ]) {
      if (!byName.has(table)) {
        throw new Error(`Missing table app.${table}`);
      }
    }
    for (const table of ['organizations', 'organization_memberships']) {
      const row = byName.get(table);
      if (!row.rowsecurity || !row.force_row_security) {
        throw new Error(`RLS/FORCE RLS is not enabled on app.${table}`);
      }
    }

    const policies = await pool.query(`
      SELECT tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'app'
    `);
    const policyNames = new Set(policies.rows.map((row) => `${row.tablename}.${row.policyname}`));
    for (const policy of [
      'organizations.organizations_tenant_isolation',
      'organization_memberships.organization_memberships_tenant_isolation',
    ]) {
      if (!policyNames.has(policy)) {
        throw new Error(`Missing policy ${policy}`);
      }
    }

    const grants = await pool.query(
      `
      SELECT has_schema_privilege($1, 'app', 'USAGE') AS schema_usage,
        has_table_privilege($1, 'app.organizations', 'SELECT,INSERT,UPDATE,DELETE') AS org_dml,
        has_function_privilege($1, 'app_private.current_organization_id()', 'EXECUTE') AS org_fn,
        has_function_privilege($1, 'app_private.active_organization_for_user(uuid)', 'EXECUTE') AS auth_fn
      `,
      [appUser],
    );
    const grant = grants.rows[0];
    if (!grant.schema_usage || !grant.org_dml || !grant.org_fn || !grant.auth_fn) {
      throw new Error(`Runtime role ${appUser} is missing required privileges.`);
    }

    const role = await pool.query(
      'SELECT rolsuper, rolcreatedb, rolcreaterole, rolbypassrls FROM pg_roles WHERE rolname = $1',
      [appUser],
    );
    if (role.rowCount !== 1 || Object.values(role.rows[0]).some(Boolean)) {
      throw new Error(`Runtime role ${appUser} has excessive privileges.`);
    }

    console.log('Database foundation validation passed.');
  } finally {
    await pool.end();
  }
});
