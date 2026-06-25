import {
  appliedMigrations,
  createMigrationPool,
  migrationFiles,
  runMain,
} from './database-utils.mjs';

await runMain(async () => {
  const pool = createMigrationPool();
  try {
    const applied = await appliedMigrations(pool);
    for (const migration of migrationFiles()) {
      const existing = applied.get(migration.filename);
      const status = existing ? 'applied' : 'pending';
      console.log(`${status}: ${migration.filename}`);
    }
  } finally {
    await pool.end();
  }
});
