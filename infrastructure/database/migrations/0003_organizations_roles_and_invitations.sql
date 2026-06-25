ALTER TABLE app.organization_memberships
  DROP CONSTRAINT IF EXISTS organization_memberships_status_check;

ALTER TABLE app.organization_memberships
  ADD CONSTRAINT organization_memberships_status_check
  CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'LEFT', 'REMOVED', 'REVOKED'));

CREATE TABLE IF NOT EXISTS app.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  role_type text NOT NULL DEFAULT 'SYSTEM',
  is_assignable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT roles_role_type_check CHECK (role_type IN ('SYSTEM')),
  CONSTRAINT roles_version_check CHECK (version >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS roles_code_ci_uidx ON app.roles (lower(code));

CREATE TABLE IF NOT EXISTS app.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT permissions_no_wildcard_check CHECK (code <> '*')
);

CREATE UNIQUE INDEX IF NOT EXISTS permissions_code_uidx ON app.permissions (code);

CREATE TABLE IF NOT EXISTS app.role_permissions (
  role_id uuid NOT NULL REFERENCES app.roles(id) ON DELETE RESTRICT,
  permission_id uuid NOT NULL REFERENCES app.permissions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT role_permissions_uidx UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS app.membership_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  membership_id uuid NOT NULL REFERENCES app.organization_memberships(id) ON DELETE RESTRICT,
  role_id uuid NOT NULL REFERENCES app.roles(id) ON DELETE RESTRICT,
  assigned_by_user_id uuid REFERENCES app.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS membership_roles_membership_id_idx
  ON app.membership_roles (membership_id);

CREATE INDEX IF NOT EXISTS membership_roles_organization_id_idx
  ON app.membership_roles (organization_id);

CREATE UNIQUE INDEX IF NOT EXISTS membership_roles_active_uidx
  ON app.membership_roles (membership_id, role_id)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS app.organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  invited_email text NOT NULL,
  invited_email_normalized text NOT NULL,
  token_hash text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  role_id uuid NOT NULL REFERENCES app.roles(id) ON DELETE RESTRICT,
  created_by_user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  accepted_by_user_id uuid REFERENCES app.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_sent_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  resend_count integer NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT organization_invitations_status_check
    CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
  CONSTRAINT organization_invitations_resend_count_check CHECK (resend_count >= 0),
  CONSTRAINT organization_invitations_version_check CHECK (version >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS organization_invitations_token_hash_uidx
  ON app.organization_invitations (token_hash);

CREATE UNIQUE INDEX IF NOT EXISTS organization_invitations_pending_email_uidx
  ON app.organization_invitations (organization_id, invited_email_normalized)
  WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS organization_invitations_organization_id_idx
  ON app.organization_invitations (organization_id);

CREATE INDEX IF NOT EXISTS organization_invitations_expires_at_idx
  ON app.organization_invitations (expires_at);

CREATE OR REPLACE FUNCTION app_private.reject_role_code_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = app, pg_temp
AS $$
BEGIN
  IF NEW.code <> OLD.code THEN
    RAISE EXCEPTION 'ROLE_CODE_IMMUTABLE';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS roles_code_immutable ON app.roles;
CREATE TRIGGER roles_code_immutable
BEFORE UPDATE ON app.roles
FOR EACH ROW EXECUTE FUNCTION app_private.reject_role_code_update();

CREATE OR REPLACE FUNCTION app_private.reject_permission_code_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = app, pg_temp
AS $$
BEGIN
  IF NEW.code <> OLD.code THEN
    RAISE EXCEPTION 'PERMISSION_CODE_IMMUTABLE';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS permissions_code_immutable ON app.permissions;
CREATE TRIGGER permissions_code_immutable
BEFORE UPDATE ON app.permissions
FOR EACH ROW EXECUTE FUNCTION app_private.reject_permission_code_update();

CREATE OR REPLACE FUNCTION app_private.validate_membership_role_organization()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = app, pg_temp
AS $$
DECLARE
  membership_organization_id uuid;
  assignable boolean;
BEGIN
  SELECT organization_id INTO membership_organization_id
  FROM app.organization_memberships
  WHERE id = NEW.membership_id;

  IF membership_organization_id IS NULL OR membership_organization_id <> NEW.organization_id THEN
    RAISE EXCEPTION 'MEMBERSHIP_ROLE_ORGANIZATION_MISMATCH';
  END IF;

  SELECT is_assignable INTO assignable FROM app.roles WHERE id = NEW.role_id;
  IF assignable IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'ROLE_NOT_ASSIGNABLE';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS membership_roles_organization_match ON app.membership_roles;
CREATE TRIGGER membership_roles_organization_match
BEFORE INSERT OR UPDATE ON app.membership_roles
FOR EACH ROW EXECUTE FUNCTION app_private.validate_membership_role_organization();

INSERT INTO app.roles (code, name, description, role_type, is_assignable)
VALUES
  ('ADMIN', 'Administrador', 'Administra organizacao, membros, convites e papeis.', 'SYSTEM', true),
  ('CONSULTANT', 'Consultor', 'Consulta organizacao, membros, convites e papeis.', 'SYSTEM', true),
  ('TAX_ANALYST', 'Analista fiscal', 'Consulta organizacao, membros e papeis.', 'SYSTEM', true),
  ('APPROVER', 'Aprovador', 'Consulta organizacao, membros e papeis.', 'SYSTEM', true),
  ('VIEWER', 'Visualizador', 'Consulta organizacao e membros.', 'SYSTEM', true)
ON CONFLICT DO NOTHING;

INSERT INTO app.permissions (code, name, description)
VALUES
  ('organization:read', 'Ler organizacao', 'Consulta dados da organizacao.'),
  ('organization:update', 'Atualizar organizacao', 'Atualiza dados da organizacao.'),
  ('organization:deactivate', 'Desativar organizacao', 'Desativa uma organizacao.'),
  ('membership:read', 'Ler membros', 'Consulta membros da organizacao.'),
  ('membership:invite', 'Convidar membros', 'Cria convites de membros.'),
  ('membership:update', 'Atualizar membros', 'Atualiza status de membros.'),
  ('membership:remove', 'Remover membros', 'Revoga membros da organizacao.'),
  ('invitation:read', 'Ler convites', 'Consulta convites da organizacao.'),
  ('invitation:create', 'Criar convites', 'Cria convites da organizacao.'),
  ('invitation:resend', 'Reenviar convites', 'Reenvia convites pendentes.'),
  ('invitation:revoke', 'Revogar convites', 'Revoga convites pendentes.'),
  ('role:read', 'Ler papeis', 'Consulta papeis.'),
  ('role:assign', 'Atribuir papeis', 'Atribui papeis a membros.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON true
WHERE roles.code = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'organization:read', 'membership:read', 'invitation:read', 'role:read'
)
WHERE roles.code = 'CONSULTANT'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN ('organization:read', 'membership:read', 'role:read')
WHERE roles.code IN ('TAX_ANALYST', 'APPROVER')
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN ('organization:read', 'membership:read')
WHERE roles.code = 'VIEWER'
ON CONFLICT DO NOTHING;

ALTER TABLE app.membership_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.membership_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE app.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.organization_invitations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS membership_roles_tenant_isolation ON app.membership_roles;
CREATE POLICY membership_roles_tenant_isolation ON app.membership_roles
  FOR ALL
  USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());

DROP POLICY IF EXISTS organization_invitations_tenant_isolation ON app.organization_invitations;
CREATE POLICY organization_invitations_tenant_isolation ON app.organization_invitations
  FOR ALL
  USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());

CREATE OR REPLACE FUNCTION app_private.organizations_for_user(p_user_id uuid)
RETURNS TABLE (
  organization_id uuid,
  organization_name text,
  organization_slug text,
  organization_status text,
  membership_id uuid,
  role_codes text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = app, pg_temp
SET row_security = off
AS $$
  SELECT organizations.id,
    organizations.name,
    organizations.slug,
    organizations.status,
    organization_memberships.id,
    coalesce(array_agg(DISTINCT roles.code) FILTER (WHERE roles.code IS NOT NULL), '{}')::text[]
  FROM app.organization_memberships
  JOIN app.organizations ON organizations.id = organization_memberships.organization_id
  LEFT JOIN app.membership_roles ON membership_roles.membership_id = organization_memberships.id
    AND membership_roles.deleted_at IS NULL
  LEFT JOIN app.roles ON roles.id = membership_roles.role_id
  WHERE organization_memberships.user_id = p_user_id
    AND organization_memberships.status = 'ACTIVE'
    AND organization_memberships.deleted_at IS NULL
    AND organizations.status = 'ACTIVE'
    AND organizations.deleted_at IS NULL
  GROUP BY organizations.id, organization_memberships.id
  ORDER BY organization_memberships.joined_at ASC NULLS LAST, organization_memberships.created_at ASC
$$;

CREATE OR REPLACE FUNCTION app_private.can_access_organization(p_user_id uuid, p_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = app, pg_temp
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM app.organization_memberships
    JOIN app.organizations ON organizations.id = organization_memberships.organization_id
    WHERE organization_memberships.user_id = p_user_id
      AND organization_memberships.organization_id = p_organization_id
      AND organization_memberships.status = 'ACTIVE'
      AND organization_memberships.deleted_at IS NULL
      AND organizations.status = 'ACTIVE'
      AND organizations.deleted_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION app_private.permissions_for_user(p_user_id uuid, p_organization_id uuid)
RETURNS TABLE (
  membership_id uuid,
  role_codes text[],
  permission_codes text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = app, pg_temp
SET row_security = off
AS $$
  SELECT organization_memberships.id,
    coalesce(array_agg(DISTINCT roles.code) FILTER (WHERE roles.code IS NOT NULL), '{}')::text[],
    coalesce(array_agg(DISTINCT permissions.code) FILTER (WHERE permissions.code IS NOT NULL), '{}')::text[]
  FROM app.organization_memberships
  JOIN app.organizations ON organizations.id = organization_memberships.organization_id
  LEFT JOIN app.membership_roles ON membership_roles.membership_id = organization_memberships.id
    AND membership_roles.deleted_at IS NULL
  LEFT JOIN app.roles ON roles.id = membership_roles.role_id
  LEFT JOIN app.role_permissions ON role_permissions.role_id = roles.id
  LEFT JOIN app.permissions ON permissions.id = role_permissions.permission_id
  WHERE organization_memberships.user_id = p_user_id
    AND organization_memberships.organization_id = p_organization_id
    AND organization_memberships.status = 'ACTIVE'
    AND organization_memberships.deleted_at IS NULL
    AND organizations.status = 'ACTIVE'
    AND organizations.deleted_at IS NULL
  GROUP BY organization_memberships.id
$$;

REVOKE ALL ON FUNCTION app_private.organizations_for_user(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.can_access_organization(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.permissions_for_user(uuid, uuid) FROM PUBLIC;
