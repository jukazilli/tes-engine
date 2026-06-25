import { createMigrationPool, grantRuntimeRole, runMain } from './database-utils.mjs';

await runMain(async () => {
  const pool = createMigrationPool();
  try {
    await grantRuntimeRole(pool);
    console.log('Database runtime role bootstrapped.');
  } finally {
    await pool.end();
  }
});
