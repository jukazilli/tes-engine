import { createMigrationPool, createRuntimePool, runMain } from './database-utils.mjs';

const userA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const userB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const orgA = 'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa';
const orgB = 'bbbbbbbb-1111-4bbb-8bbb-bbbbbbbbbbbb';

async function visibleOrganizations(pool, organizationId, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_organization_id', $1, true)", [
      organizationId,
    ]);
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId]);
    const result = await client.query('SELECT id FROM app.organizations ORDER BY id');
    await client.query('COMMIT');
    return result.rows.map((row) => row.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function visibleCompanies(pool, organizationId, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_organization_id', $1, true)", [
      organizationId,
    ]);
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId]);
    const result = await client.query('SELECT id FROM app.companies ORDER BY id');
    await client.query('COMMIT');
    return result.rows.map((row) => row.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

await runMain(async () => {
  const admin = createMigrationPool();
  const runtime = createRuntimePool();
  try {
    await admin.query('DELETE FROM app.companies WHERE organization_id = ANY($1::uuid[])', [
      [orgA, orgB],
    ]);
    await admin.query(
      'DELETE FROM app.organization_memberships WHERE organization_id = ANY($1::uuid[]) OR user_id = ANY($2::uuid[])',
      [
        [orgA, orgB],
        [userA, userB],
      ],
    );
    await admin.query('DELETE FROM app.organizations WHERE id = ANY($1::uuid[])', [[orgA, orgB]]);
    await admin.query('DELETE FROM app.users WHERE id = ANY($1::uuid[])', [[userA, userB]]);
    await admin.query(
      "INSERT INTO app.users (id, email, display_name, status) VALUES ($1, 'rls-a@example.test', 'RLS A', 'ACTIVE'), ($2, 'rls-b@example.test', 'RLS B', 'ACTIVE')",
      [userA, userB],
    );
    await admin.query(
      "INSERT INTO app.organizations (id, name, slug, status) VALUES ($1, 'RLS Org A', 'rls-org-a', 'ACTIVE'), ($2, 'RLS Org B', 'rls-org-b', 'ACTIVE')",
      [orgA, orgB],
    );
    await admin.query(
      "INSERT INTO app.organization_memberships (organization_id, user_id, status, joined_at) VALUES ($1, $2, 'ACTIVE', now()), ($3, $4, 'ACTIVE', now())",
      [orgA, userA, orgB, userB],
    );
    await admin.query(
      "INSERT INTO app.companies (id, organization_id, legal_name, tax_id_root, tax_regime, status) VALUES ('aaaaaaaa-2222-4aaa-8aaa-aaaaaaaaaaaa', $1, 'RLS Company A', '12345678', 'LUCRO_REAL', 'ACTIVE'), ('bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb', $2, 'RLS Company B', '87654321', 'LUCRO_REAL', 'ACTIVE')",
      [orgA, orgB],
    );

    const withoutContext = await runtime.query(
      'SELECT id FROM app.organizations WHERE id = ANY($1::uuid[])',
      [[orgA, orgB]],
    );
    if (withoutContext.rowCount !== 0) {
      throw new Error('RLS allowed organization rows without tenant context.');
    }

    const visibleA = await visibleOrganizations(runtime, orgA, userA);
    const visibleB = await visibleOrganizations(runtime, orgB, userB);
    if (
      visibleA.length !== 1 ||
      visibleA[0] !== orgA ||
      visibleB.length !== 1 ||
      visibleB[0] !== orgB
    ) {
      throw new Error('RLS tenant isolation returned unexpected organization visibility.');
    }

    const companiesA = await visibleCompanies(runtime, orgA, userA);
    const companiesB = await visibleCompanies(runtime, orgB, userB);
    if (
      companiesA.length !== 1 ||
      companiesA[0] !== 'aaaaaaaa-2222-4aaa-8aaa-aaaaaaaaaaaa' ||
      companiesB.length !== 1 ||
      companiesB[0] !== 'bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb'
    ) {
      throw new Error('RLS tenant isolation returned unexpected company visibility.');
    }

    const invalidContext = await visibleOrganizations(runtime, 'not-a-uuid', userA);
    if (invalidContext.length !== 0) {
      throw new Error('Invalid tenant context should not expose rows.');
    }

    const client = await runtime.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.current_organization_id', $1, true)", [orgA]);
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [userA]);
      const update = await client.query('UPDATE app.organizations SET name = name WHERE id = $1', [
        orgB,
      ]);
      if (update.rowCount !== 0) {
        throw new Error('RLS allowed cross-tenant update.');
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    console.log('Database RLS test passed.');
  } finally {
    await admin.query('DELETE FROM app.companies WHERE organization_id = ANY($1::uuid[])', [
      [orgA, orgB],
    ]);
    await admin.query(
      'DELETE FROM app.organization_memberships WHERE organization_id = ANY($1::uuid[]) OR user_id = ANY($2::uuid[])',
      [
        [orgA, orgB],
        [userA, userB],
      ],
    );
    await admin.query('DELETE FROM app.organizations WHERE id = ANY($1::uuid[])', [[orgA, orgB]]);
    await admin.query('DELETE FROM app.users WHERE id = ANY($1::uuid[])', [[userA, userB]]);
    await admin.end();
    await runtime.end();
  }
});
