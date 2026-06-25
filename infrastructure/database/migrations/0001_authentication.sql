CREATE TABLE IF NOT EXISTS app.user_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  password_hash text NOT NULL,
  password_changed_at timestamptz NOT NULL DEFAULT now(),
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT user_credentials_failed_attempts_check CHECK (failed_attempts >= 0),
  CONSTRAINT user_credentials_version_check CHECK (version >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS user_credentials_user_id_uidx
  ON app.user_credentials (user_id);

CREATE TABLE IF NOT EXISTS app.email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  token_digest text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  email_sent boolean NOT NULL DEFAULT false,
  CONSTRAINT email_verification_tokens_version_check CHECK (version >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS email_verification_tokens_digest_uidx
  ON app.email_verification_tokens (token_digest);

CREATE INDEX IF NOT EXISTS email_verification_tokens_user_id_idx
  ON app.email_verification_tokens (user_id);

CREATE INDEX IF NOT EXISTS email_verification_tokens_expires_at_idx
  ON app.email_verification_tokens (expires_at);

CREATE OR REPLACE FUNCTION app_private.active_organization_for_user(p_user_id uuid)
RETURNS TABLE (
  organization_id uuid,
  organization_name text,
  organization_slug text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
  SELECT organizations.id, organizations.name, organizations.slug
  FROM app.organization_memberships
  JOIN app.organizations ON organizations.id = organization_memberships.organization_id
  WHERE organization_memberships.user_id = p_user_id
    AND organization_memberships.status = 'ACTIVE'
    AND organization_memberships.deleted_at IS NULL
    AND organizations.status = 'ACTIVE'
    AND organizations.deleted_at IS NULL
  ORDER BY organization_memberships.joined_at ASC NULLS LAST,
    organization_memberships.created_at ASC
  LIMIT 1
$$;
