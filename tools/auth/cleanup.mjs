import { createMigrationPool, runMain } from '../database/database-utils.mjs';

await runMain(async () => {
  const pool = createMigrationPool();
  try {
    await pool.query(`
      UPDATE app.user_sessions
      SET status = 'EXPIRED',
        revoked_at = COALESCE(revoked_at, now()),
        revoked_reason = COALESCE(revoked_reason, 'CLEANUP_EXPIRED')
      WHERE status = 'ACTIVE'
        AND expires_at < now()
    `);

    await pool.query(`
      DELETE FROM app.email_verification_tokens
      WHERE (expires_at < now() OR consumed_at IS NOT NULL)
        AND created_at < now() - interval '7 days'
    `);

    await pool.query(`
      DELETE FROM app.password_reset_tokens
      WHERE (expires_at < now() OR consumed_at IS NOT NULL)
        AND created_at < now() - interval '7 days'
    `);

    await pool.query(`
      DELETE FROM app.login_attempts
      WHERE created_at < now() - interval '90 days'
    `);

    await pool.query(`
      DELETE FROM app.email_delivery_events
      WHERE created_at < now() - interval '180 days'
    `);

    console.log('Authentication cleanup completed.');
  } finally {
    await pool.end();
  }
});
