CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS app_private;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;

CREATE TABLE IF NOT EXISTS app_private.schema_migrations (
  filename text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION app_private.current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN current_setting('app.current_organization_id', true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN current_setting('app.current_organization_id', true)::uuid
    ELSE NULL
  END
$$;

CREATE OR REPLACE FUNCTION app_private.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN current_setting('app.current_user_id', true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN current_setting('app.current_user_id', true)::uuid
    ELSE NULL
  END
$$;

CREATE TABLE IF NOT EXISTS app.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT users_status_check CHECK (status IN ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DELETED')),
  CONSTRAINT users_version_check CHECK (version >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_ci_uidx
  ON app.users (lower(email))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS users_status_idx ON app.users (status);

CREATE TABLE IF NOT EXISTS app.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT organizations_status_check CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
  CONSTRAINT organizations_version_check CHECK (version >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_active_ci_uidx
  ON app.organizations (lower(slug))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS organizations_status_idx ON app.organizations (status);

CREATE TABLE IF NOT EXISTS app.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'INVITED',
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT organization_memberships_status_check CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'LEFT', 'REMOVED')),
  CONSTRAINT organization_memberships_version_check CHECK (version >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS organization_memberships_active_uidx
  ON app.organization_memberships (organization_id, user_id)
  WHERE deleted_at IS NULL AND status IN ('INVITED', 'ACTIVE', 'SUSPENDED');

CREATE INDEX IF NOT EXISTS organization_memberships_organization_id_idx
  ON app.organization_memberships (organization_id);

CREATE INDEX IF NOT EXISTS organization_memberships_user_id_idx
  ON app.organization_memberships (user_id);

ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE app.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.organization_memberships FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS organizations_tenant_isolation ON app.organizations;
CREATE POLICY organizations_tenant_isolation ON app.organizations
  FOR ALL
  USING (id = app_private.current_organization_id())
  WITH CHECK (id = app_private.current_organization_id());

DROP POLICY IF EXISTS organization_memberships_tenant_isolation ON app.organization_memberships;
CREATE POLICY organization_memberships_tenant_isolation ON app.organization_memberships
  FOR ALL
  USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());
