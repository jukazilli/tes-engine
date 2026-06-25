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
      if (!existing) {
        throw new Error(`Pending migration: ${migration.filename}`);
      }
      if (existing.checksum !== migration.checksum) {
        throw new Error(`Migration checksum mismatch: ${migration.filename}`);
      }
    }
    console.log('Database migration check passed.');
  } finally {
    await pool.end();
  }
});
