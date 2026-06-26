CREATE TABLE IF NOT EXISTS app.tax_domains (
  code text PRIMARY KEY,
  label text NOT NULL,
  description text,
  display_order integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  supports_legacy boolean NOT NULL DEFAULT true,
  supports_configtrib boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tax_domains_code_check CHECK (code ~ '^[A-Z0-9_]{2,40}$'),
  CONSTRAINT tax_domains_display_order_check CHECK (display_order > 0)
);

INSERT INTO app.tax_domains (
  code, label, description, display_order, active, supports_legacy, supports_configtrib
)
VALUES
  ('ICMS', 'ICMS', 'Imposto sobre Circulacao de Mercadorias e Servicos.', 10, true, true, true),
  ('ICMS_ST', 'ICMS ST', 'ICMS por substituicao tributaria.', 20, true, true, true),
  ('IPI', 'IPI', 'Imposto sobre Produtos Industrializados.', 30, true, true, true),
  ('PIS', 'PIS', 'Programa de Integracao Social.', 40, true, true, true),
  ('COFINS', 'COFINS', 'Contribuicao para o Financiamento da Seguridade Social.', 50, true, true, true),
  ('ISS', 'ISS', 'Imposto sobre Servicos.', 60, true, true, true),
  ('DIFAL', 'DIFAL', 'Diferencial de aliquota do ICMS.', 70, true, true, true),
  ('FCP', 'FCP', 'Fundo de Combate a Pobreza.', 80, true, true, true)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE app.protheus_environments
  ADD CONSTRAINT protheus_environments_org_id_branch_uidx
  UNIQUE (organization_id, id, branch_id);

CREATE TABLE IF NOT EXISTS app.environment_tax_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  environment_id uuid NOT NULL,
  branch_id uuid NOT NULL,
  mode text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  valid_from date NOT NULL,
  valid_until date,
  source_type text NOT NULL,
  source_reference text,
  notes text,
  confirmed_by_user_id uuid REFERENCES app.users(id) ON DELETE RESTRICT,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT environment_tax_strategies_org_id_uidx UNIQUE (organization_id, id),
  CONSTRAINT environment_tax_strategies_environment_branch_fk FOREIGN KEY (
    organization_id, environment_id, branch_id
  ) REFERENCES app.protheus_environments(organization_id, id, branch_id) ON DELETE RESTRICT,
  CONSTRAINT environment_tax_strategies_mode_check CHECK (
    mode IN ('LEGACY', 'HYBRID', 'FULL_CONFIGTRIB')
  ),
  CONSTRAINT environment_tax_strategies_status_check CHECK (
    status IN ('DRAFT', 'PENDING_REVIEW', 'CONFIRMED', 'SUPERSEDED', 'DEACTIVATED')
  ),
  CONSTRAINT environment_tax_strategies_source_check CHECK (
    source_type IN ('MANUAL', 'IMPORTED_CONFIGURATION', 'FISCAL_REVIEW', 'SYSTEM_SUGGESTION')
  ),
  CONSTRAINT environment_tax_strategies_valid_range_check CHECK (
    valid_until IS NULL OR valid_until >= valid_from
  ),
  CONSTRAINT environment_tax_strategies_version_check CHECK (version >= 1),
  CONSTRAINT environment_tax_strategies_confirmed_check CHECK (
    (status = 'CONFIRMED' AND confirmed_by_user_id IS NOT NULL AND confirmed_at IS NOT NULL)
    OR (status <> 'CONFIRMED')
  ),
  CONSTRAINT environment_tax_strategies_system_suggestion_check CHECK (
    source_type <> 'SYSTEM_SUGGESTION' OR status <> 'CONFIRMED'
  )
);

CREATE INDEX IF NOT EXISTS environment_tax_strategies_organization_id_idx
  ON app.environment_tax_strategies (organization_id);
CREATE INDEX IF NOT EXISTS environment_tax_strategies_environment_id_idx
  ON app.environment_tax_strategies (environment_id);
CREATE INDEX IF NOT EXISTS environment_tax_strategies_branch_id_idx
  ON app.environment_tax_strategies (branch_id);
CREATE INDEX IF NOT EXISTS environment_tax_strategies_status_idx
  ON app.environment_tax_strategies (status);

CREATE TABLE IF NOT EXISTS app.environment_tax_strategy_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  strategy_id uuid NOT NULL,
  tax_domain_code text NOT NULL REFERENCES app.tax_domains(code) ON DELETE RESTRICT,
  owner_code text NOT NULL,
  not_applicable_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT environment_tax_strategy_items_strategy_org_fk FOREIGN KEY (organization_id, strategy_id)
    REFERENCES app.environment_tax_strategies(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT environment_tax_strategy_items_owner_check CHECK (
    owner_code IN ('LEGACY_TES', 'CONFIGTRIB', 'NOT_APPLICABLE')
  ),
  CONSTRAINT environment_tax_strategy_items_reason_check CHECK (
    (owner_code = 'NOT_APPLICABLE' AND nullif(btrim(not_applicable_reason), '') IS NOT NULL)
    OR (owner_code <> 'NOT_APPLICABLE' AND not_applicable_reason IS NULL)
  ),
  CONSTRAINT environment_tax_strategy_items_version_check CHECK (version >= 1),
  CONSTRAINT environment_tax_strategy_items_uidx UNIQUE (
    organization_id, strategy_id, tax_domain_code
  )
);

CREATE INDEX IF NOT EXISTS environment_tax_strategy_items_organization_id_idx
  ON app.environment_tax_strategy_items (organization_id);
CREATE INDEX IF NOT EXISTS environment_tax_strategy_items_strategy_id_idx
  ON app.environment_tax_strategy_items (strategy_id);
CREATE INDEX IF NOT EXISTS environment_tax_strategy_items_tax_domain_idx
  ON app.environment_tax_strategy_items (tax_domain_code);

CREATE OR REPLACE FUNCTION app_private.reject_confirmed_tax_strategy_overlap()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = app, pg_temp
AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' AND EXISTS (
    SELECT 1
    FROM app.environment_tax_strategies existing
    WHERE existing.organization_id = NEW.organization_id
      AND existing.environment_id = NEW.environment_id
      AND existing.id <> NEW.id
      AND existing.status = 'CONFIRMED'
      AND existing.deleted_at IS NULL
      AND daterange(existing.valid_from, coalesce(existing.valid_until, 'infinity'::date), '[]')
        && daterange(NEW.valid_from, coalesce(NEW.valid_until, 'infinity'::date), '[]')
  ) THEN
    RAISE EXCEPTION 'TAX_STRATEGY_OVERLAP';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS environment_tax_strategies_no_overlap
  ON app.environment_tax_strategies;
CREATE TRIGGER environment_tax_strategies_no_overlap
BEFORE INSERT OR UPDATE ON app.environment_tax_strategies
FOR EACH ROW EXECUTE FUNCTION app_private.reject_confirmed_tax_strategy_overlap();

INSERT INTO app.permissions (code, name, description)
VALUES
  ('tax-strategy:read', 'Ler estrategias tributarias', 'Consulta estrategias tributarias do ambiente.'),
  ('tax-strategy:create', 'Criar estrategias tributarias', 'Cria estrategias tributarias do ambiente.'),
  ('tax-strategy:update', 'Atualizar estrategias tributarias', 'Atualiza estrategias tributarias em draft.'),
  ('tax-strategy:submit-review', 'Enviar estrategia para revisao', 'Envia estrategia tributaria para revisao.'),
  ('tax-strategy:confirm', 'Confirmar estrategia tributaria', 'Confirma estrategia tributaria revisada.'),
  ('tax-strategy:deactivate', 'Desativar estrategia tributaria', 'Desativa estrategia tributaria.'),
  ('tax-context:resolve', 'Resolver contexto tributario', 'Resolve snapshot tributario confirmado por data.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'tax-strategy:read', 'tax-strategy:create', 'tax-strategy:update',
  'tax-strategy:submit-review', 'tax-strategy:confirm', 'tax-strategy:deactivate',
  'tax-context:resolve'
)
WHERE roles.code = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'tax-strategy:read', 'tax-strategy:create', 'tax-strategy:update',
  'tax-strategy:submit-review', 'tax-context:resolve'
)
WHERE roles.code = 'CONSULTANT'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'tax-strategy:read', 'tax-strategy:create', 'tax-strategy:update',
  'tax-strategy:submit-review', 'tax-strategy:confirm', 'tax-context:resolve'
)
WHERE roles.code = 'TAX_ANALYST'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'tax-strategy:read', 'tax-strategy:confirm', 'tax-context:resolve'
)
WHERE roles.code = 'APPROVER'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN ('tax-strategy:read', 'tax-context:resolve')
WHERE roles.code = 'VIEWER'
ON CONFLICT DO NOTHING;

ALTER TABLE app.environment_tax_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.environment_tax_strategies FORCE ROW LEVEL SECURITY;
ALTER TABLE app.environment_tax_strategy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.environment_tax_strategy_items FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS environment_tax_strategies_tenant_isolation
  ON app.environment_tax_strategies;
CREATE POLICY environment_tax_strategies_tenant_isolation
  ON app.environment_tax_strategies
  FOR ALL USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());

DROP POLICY IF EXISTS environment_tax_strategy_items_tenant_isolation
  ON app.environment_tax_strategy_items;
CREATE POLICY environment_tax_strategy_items_tenant_isolation
  ON app.environment_tax_strategy_items
  FOR ALL USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());
