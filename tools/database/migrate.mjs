import {
  appliedMigrations,
  createMigrationPool,
  ensureMigrationTable,
  grantRuntimeRole,
  migrationFiles,
  runMain,
} from './database-utils.mjs';

await runMain(async () => {
  const pool = createMigrationPool();
  try {
    await ensureMigrationTable(pool);
    const applied = await appliedMigrations(pool);

    for (const migration of migrationFiles()) {
      const existing = applied.get(migration.filename);
      if (existing?.checksum === migration.checksum) {
        continue;
      }
      if (existing) {
        throw new Error(`Migration checksum mismatch: ${migration.filename}`);
      }

      await pool.query('BEGIN');
      try {
        await pool.query(migration.sql);
        await pool.query(
          'INSERT INTO app_private.schema_migrations (filename, checksum) VALUES ($1, $2)',
          [migration.filename, migration.checksum],
        );
        await pool.query('COMMIT');
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }

      console.log(`Applied ${migration.filename}.`);
    }

    await grantRuntimeRole(pool);
    console.log('Database migrations are up to date.');
  } finally {
    await pool.end();
  }
});
