import { createMigrationPool, createRuntimePool, runMain } from './database-utils.mjs';

const userId = '11111111-1111-4111-8111-111111111111';
const organizationId = '22222222-2222-4222-8222-222222222222';

await runMain(async () => {
  const admin = createMigrationPool();
  const runtime = createRuntimePool();
  try {
    await admin.query(
      'DELETE FROM app.organization_memberships WHERE organization_id = $1 OR user_id = $2',
      [organizationId, userId],
    );
    await admin.query('DELETE FROM app.organizations WHERE id = $1', [organizationId]);
    await admin.query('DELETE FROM app.users WHERE id = $1', [userId]);
    await admin.query(
      "INSERT INTO app.users (id, email, display_name, status) VALUES ($1, 'db.integration@example.test', 'DB Integration', 'ACTIVE')",
      [userId],
    );
    await admin.query(
      "INSERT INTO app.organizations (id, name, slug, status) VALUES ($1, 'DB Integration Org', 'db-integration-org', 'ACTIVE')",
      [organizationId],
    );
    await admin.query(
      "INSERT INTO app.organization_memberships (organization_id, user_id, status, joined_at) VALUES ($1, $2, 'ACTIVE', now())",
      [organizationId, userId],
    );

    const client = await runtime.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.current_organization_id', $1, true)", [
        organizationId,
      ]);
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId]);
      const result = await client.query('SELECT id, slug FROM app.organizations WHERE id = $1', [
        organizationId,
      ]);
      if (result.rowCount !== 1) {
        throw new Error('Runtime tenant query did not return the seeded organization.');
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    console.log('Database integration test passed.');
  } finally {
    await admin.query(
      'DELETE FROM app.organization_memberships WHERE organization_id = $1 OR user_id = $2',
      [organizationId, userId],
    );
    await admin.query('DELETE FROM app.organizations WHERE id = $1', [organizationId]);
    await admin.query('DELETE FROM app.users WHERE id = $1', [userId]);
    await admin.end();
    await runtime.end();
  }
});
