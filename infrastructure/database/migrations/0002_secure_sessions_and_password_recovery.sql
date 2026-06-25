CREATE TABLE IF NOT EXISTS app.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  requested_ip_hash text
);

CREATE UNIQUE INDEX IF NOT EXISTS password_reset_tokens_hash_uidx
  ON app.password_reset_tokens (token_hash);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx
  ON app.password_reset_tokens (user_id);

CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx
  ON app.password_reset_tokens (expires_at);

CREATE TABLE IF NOT EXISTS app.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  token_hash text NOT NULL,
  csrf_token_hash text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revoked_reason text,
  ip_hash text,
  user_agent text,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT user_sessions_status_check CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
  CONSTRAINT user_sessions_version_check CHECK (version >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS user_sessions_token_hash_uidx
  ON app.user_sessions (token_hash);

CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx
  ON app.user_sessions (user_id);

CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx
  ON app.user_sessions (expires_at);

CREATE INDEX IF NOT EXISTS user_sessions_status_idx
  ON app.user_sessions (status);

CREATE TABLE IF NOT EXISTS app.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app.users(id) ON DELETE RESTRICT,
  email_fingerprint text NOT NULL,
  ip_fingerprint text,
  successful boolean NOT NULL,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_attempts_email_created_at_idx
  ON app.login_attempts (email_fingerprint, created_at);

CREATE INDEX IF NOT EXISTS login_attempts_ip_created_at_idx
  ON app.login_attempts (ip_fingerprint, created_at);

CREATE TABLE IF NOT EXISTS app.email_delivery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app.users(id) ON DELETE RESTRICT,
  message_type text NOT NULL,
  provider text NOT NULL,
  provider_message_id text,
  recipient_fingerprint text NOT NULL,
  status text NOT NULL,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_delivery_events_user_id_idx
  ON app.email_delivery_events (user_id);

CREATE INDEX IF NOT EXISTS email_delivery_events_created_at_idx
  ON app.email_delivery_events (created_at);

CREATE INDEX IF NOT EXISTS email_delivery_events_recipient_idx
  ON app.email_delivery_events (recipient_fingerprint);
