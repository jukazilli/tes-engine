CREATE TABLE IF NOT EXISTS app.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  legal_name text NOT NULL,
  trade_name text,
  tax_id_root char(8) NOT NULL,
  tax_regime text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT companies_organization_id_id_uidx UNIQUE (organization_id, id),
  CONSTRAINT companies_tax_id_root_check CHECK (tax_id_root ~ '^[0-9]{8}$'),
  CONSTRAINT companies_tax_regime_check CHECK (tax_regime IN (
    'LUCRO_REAL', 'LUCRO_PRESUMIDO', 'SIMPLES_NACIONAL', 'MEI',
    'IMUNE', 'ISENTA', 'OUTROS', 'NAO_INFORMADO'
  )),
  CONSTRAINT companies_status_check CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
  CONSTRAINT companies_version_check CHECK (version >= 1)
);

CREATE INDEX IF NOT EXISTS companies_organization_id_idx ON app.companies (organization_id);
CREATE INDEX IF NOT EXISTS companies_status_idx ON app.companies (status);
CREATE UNIQUE INDEX IF NOT EXISTS companies_tax_id_root_active_uidx
  ON app.companies (organization_id, tax_id_root)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS app.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  company_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  cnpj char(14) NOT NULL,
  state_registration text,
  municipal_registration text,
  establishment_type text NOT NULL DEFAULT 'FILIAL',
  is_headquarters boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT branches_organization_id_id_uidx UNIQUE (organization_id, id),
  CONSTRAINT branches_company_org_fk FOREIGN KEY (organization_id, company_id)
    REFERENCES app.companies(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT branches_cnpj_check CHECK (cnpj ~ '^[0-9]{14}$'),
  CONSTRAINT branches_establishment_type_check CHECK (establishment_type IN ('MATRIZ', 'FILIAL', 'OUTRO')),
  CONSTRAINT branches_status_check CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
  CONSTRAINT branches_version_check CHECK (version >= 1),
  CONSTRAINT branches_headquarters_consistency_check CHECK (
    (is_headquarters AND establishment_type = 'MATRIZ')
    OR (NOT is_headquarters AND establishment_type <> 'MATRIZ')
  )
);

CREATE INDEX IF NOT EXISTS branches_organization_id_idx ON app.branches (organization_id);
CREATE INDEX IF NOT EXISTS branches_company_id_idx ON app.branches (company_id);
CREATE INDEX IF NOT EXISTS branches_status_idx ON app.branches (status);
CREATE UNIQUE INDEX IF NOT EXISTS branches_cnpj_active_uidx
  ON app.branches (organization_id, cnpj)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS branches_headquarters_active_uidx
  ON app.branches (organization_id, company_id)
  WHERE is_headquarters = true AND status = 'ACTIVE' AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS app.branch_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  branch_id uuid NOT NULL,
  address_type text NOT NULL DEFAULT 'FISCAL',
  street text NOT NULL,
  number text NOT NULL,
  complement text,
  district text NOT NULL,
  postal_code char(8) NOT NULL,
  city_name text NOT NULL,
  municipality_ibge_code char(7),
  state_code char(2) NOT NULL,
  country_code char(2) NOT NULL DEFAULT 'BR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT branch_addresses_branch_org_fk FOREIGN KEY (organization_id, branch_id)
    REFERENCES app.branches(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT branch_addresses_address_type_check CHECK (address_type IN ('FISCAL')),
  CONSTRAINT branch_addresses_postal_code_check CHECK (postal_code ~ '^[0-9]{8}$'),
  CONSTRAINT branch_addresses_municipality_check CHECK (
    municipality_ibge_code IS NULL OR municipality_ibge_code ~ '^[0-9]{7}$'
  ),
  CONSTRAINT branch_addresses_state_code_check CHECK (state_code ~ '^[A-Z]{2}$'),
  CONSTRAINT branch_addresses_country_code_check CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT branch_addresses_version_check CHECK (version >= 1)
);

CREATE INDEX IF NOT EXISTS branch_addresses_organization_id_idx ON app.branch_addresses (organization_id);
CREATE INDEX IF NOT EXISTS branch_addresses_branch_id_idx ON app.branch_addresses (branch_id);
CREATE UNIQUE INDEX IF NOT EXISTS branch_addresses_fiscal_active_uidx
  ON app.branch_addresses (organization_id, branch_id, address_type)
  WHERE address_type = 'FISCAL' AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS app.protheus_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  branch_id uuid NOT NULL,
  name text NOT NULL,
  environment_type text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  protheus_product text NOT NULL DEFAULT 'PROTHEUS',
  protheus_major_version text NOT NULL,
  protheus_release text NOT NULL,
  protheus_company_code text NOT NULL,
  protheus_branch_code text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT protheus_environments_organization_id_id_uidx UNIQUE (organization_id, id),
  CONSTRAINT protheus_environments_branch_org_fk FOREIGN KEY (organization_id, branch_id)
    REFERENCES app.branches(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT protheus_environments_type_check CHECK (environment_type IN ('DEVELOPMENT', 'HOMOLOGATION', 'PRODUCTION', 'OTHER')),
  CONSTRAINT protheus_environments_status_check CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
  CONSTRAINT protheus_environments_product_check CHECK (protheus_product = 'PROTHEUS'),
  CONSTRAINT protheus_environments_version_format_check CHECK (
    protheus_major_version ~ '^[0-9]{1,2}(\\.[0-9]{1,4}){0,3}$'
    AND protheus_release ~ '^[0-9]{1,2}(\\.[0-9]{1,4}){0,3}$'
  ),
  CONSTRAINT protheus_environments_code_check CHECK (
    protheus_company_code ~ '^[A-Z0-9_.-]{1,20}$'
    AND protheus_branch_code ~ '^[A-Z0-9_.-]{1,20}$'
  ),
  CONSTRAINT protheus_environments_version_check CHECK (version >= 1)
);

CREATE INDEX IF NOT EXISTS protheus_environments_organization_id_idx ON app.protheus_environments (organization_id);
CREATE INDEX IF NOT EXISTS protheus_environments_branch_id_idx ON app.protheus_environments (branch_id);
CREATE INDEX IF NOT EXISTS protheus_environments_status_idx ON app.protheus_environments (status);
CREATE UNIQUE INDEX IF NOT EXISTS protheus_environments_name_active_uidx
  ON app.protheus_environments (organization_id, branch_id, lower(name))
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS protheus_environments_code_active_uidx
  ON app.protheus_environments (
    organization_id, branch_id, environment_type, protheus_company_code, protheus_branch_code
  )
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS app.branch_fiscal_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  branch_id uuid NOT NULL,
  tax_regime_code text NOT NULL,
  nfe_crt_code text NOT NULL,
  icms_taxpayer_indicator text NOT NULL,
  protheus_parameter_name text,
  protheus_parameter_value text,
  protheus_parameter_normalized_value text,
  source_type text NOT NULL,
  source_reference text,
  valid_from date NOT NULL,
  valid_until date,
  status text NOT NULL DEFAULT 'PENDING_REVIEW',
  confirmed_by_user_id uuid REFERENCES app.users(id) ON DELETE RESTRICT,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT branch_fiscal_profiles_branch_org_fk FOREIGN KEY (organization_id, branch_id)
    REFERENCES app.branches(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT branch_fiscal_profiles_tax_regime_check CHECK (tax_regime_code IN (
    'LUCRO_REAL', 'LUCRO_PRESUMIDO', 'SIMPLES_NACIONAL', 'MEI',
    'IMUNE', 'ISENTA', 'OUTROS', 'NAO_INFORMADO'
  )),
  CONSTRAINT branch_fiscal_profiles_nfe_crt_check CHECK (nfe_crt_code IN ('1', '2', '3', '4', 'NAO_INFORMADO')),
  CONSTRAINT branch_fiscal_profiles_icms_check CHECK (icms_taxpayer_indicator IN (
    'CONTRIBUINTE', 'CONTRIBUINTE_ISENTO', 'NAO_CONTRIBUINTE', 'NAO_INFORMADO'
  )),
  CONSTRAINT branch_fiscal_profiles_source_check CHECK (source_type IN (
    'MANUAL', 'PROTHEUS_PARAMETER', 'IMPORTED_FILE', 'SYSTEM_INFERENCE', 'FISCAL_REVIEW'
  )),
  CONSTRAINT branch_fiscal_profiles_status_check CHECK (status IN (
    'DRAFT', 'PENDING_REVIEW', 'CONFIRMED', 'SUPERSEDED', 'DEACTIVATED'
  )),
  CONSTRAINT branch_fiscal_profiles_valid_range_check CHECK (valid_until IS NULL OR valid_until >= valid_from),
  CONSTRAINT branch_fiscal_profiles_version_check CHECK (version >= 1)
);

CREATE INDEX IF NOT EXISTS branch_fiscal_profiles_organization_id_idx ON app.branch_fiscal_profiles (organization_id);
CREATE INDEX IF NOT EXISTS branch_fiscal_profiles_branch_id_idx ON app.branch_fiscal_profiles (branch_id);

CREATE TABLE IF NOT EXISTS app.protheus_parameter_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES app.organizations(id) ON DELETE RESTRICT,
  environment_id uuid NOT NULL,
  parameter_name text NOT NULL,
  parameter_value text NOT NULL,
  normalized_value text,
  canonical_domain text NOT NULL,
  canonical_code text,
  source_type text NOT NULL,
  captured_at timestamptz NOT NULL,
  validated_at timestamptz,
  validated_by_user_id uuid REFERENCES app.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT protheus_parameter_mappings_env_org_fk FOREIGN KEY (organization_id, environment_id)
    REFERENCES app.protheus_environments(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT protheus_parameter_mappings_name_check CHECK (parameter_name IN ('MV_CODREG')),
  CONSTRAINT protheus_parameter_mappings_source_check CHECK (source_type IN (
    'MANUAL', 'PROTHEUS_PARAMETER', 'IMPORTED_FILE', 'SYSTEM_INFERENCE', 'FISCAL_REVIEW'
  )),
  CONSTRAINT protheus_parameter_mappings_version_check CHECK (version >= 1)
);

CREATE INDEX IF NOT EXISTS protheus_parameter_mappings_organization_id_idx ON app.protheus_parameter_mappings (organization_id);
CREATE INDEX IF NOT EXISTS protheus_parameter_mappings_environment_id_idx ON app.protheus_parameter_mappings (environment_id);

CREATE OR REPLACE FUNCTION app_private.validate_branch_company_root()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = app, pg_temp
AS $$
DECLARE
  company_root char(8);
BEGIN
  SELECT tax_id_root INTO company_root
  FROM app.companies
  WHERE organization_id = NEW.organization_id AND id = NEW.company_id AND deleted_at IS NULL;

  IF company_root IS NULL THEN
    RAISE EXCEPTION 'COMPANY_NOT_FOUND';
  END IF;

  IF substring(NEW.cnpj from 1 for 8) <> company_root THEN
    RAISE EXCEPTION 'BRANCH_CNPJ_ROOT_MISMATCH';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS branches_company_root_match ON app.branches;
CREATE TRIGGER branches_company_root_match
BEFORE INSERT OR UPDATE OF organization_id, company_id, cnpj ON app.branches
FOR EACH ROW EXECUTE FUNCTION app_private.validate_branch_company_root();

CREATE OR REPLACE FUNCTION app_private.reject_confirmed_fiscal_profile_overlap()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = app, pg_temp
AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' AND EXISTS (
    SELECT 1
    FROM app.branch_fiscal_profiles existing
    WHERE existing.organization_id = NEW.organization_id
      AND existing.branch_id = NEW.branch_id
      AND existing.id <> NEW.id
      AND existing.status = 'CONFIRMED'
      AND existing.deleted_at IS NULL
      AND daterange(existing.valid_from, coalesce(existing.valid_until, 'infinity'::date), '[]')
        && daterange(NEW.valid_from, coalesce(NEW.valid_until, 'infinity'::date), '[]')
  ) THEN
    RAISE EXCEPTION 'BRANCH_FISCAL_PROFILE_OVERLAP';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS branch_fiscal_profiles_no_overlap ON app.branch_fiscal_profiles;
CREATE TRIGGER branch_fiscal_profiles_no_overlap
BEFORE INSERT OR UPDATE ON app.branch_fiscal_profiles
FOR EACH ROW EXECUTE FUNCTION app_private.reject_confirmed_fiscal_profile_overlap();

INSERT INTO app.permissions (code, name, description)
VALUES
  ('company:read', 'Ler empresas', 'Consulta empresas.'),
  ('company:create', 'Criar empresas', 'Cria empresas.'),
  ('company:update', 'Atualizar empresas', 'Atualiza empresas.'),
  ('company:deactivate', 'Desativar empresas', 'Desativa empresas.'),
  ('branch:read', 'Ler filiais', 'Consulta filiais.'),
  ('branch:create', 'Criar filiais', 'Cria filiais.'),
  ('branch:update', 'Atualizar filiais', 'Atualiza filiais.'),
  ('branch:deactivate', 'Desativar filiais', 'Desativa filiais.'),
  ('environment:read', 'Ler ambientes', 'Consulta ambientes Protheus.'),
  ('environment:create', 'Criar ambientes', 'Cria ambientes Protheus.'),
  ('environment:update', 'Atualizar ambientes', 'Atualiza ambientes Protheus.'),
  ('environment:deactivate', 'Desativar ambientes', 'Desativa ambientes Protheus.'),
  ('branch-fiscal-profile:read', 'Ler perfis fiscais', 'Consulta perfis fiscais da filial.'),
  ('branch-fiscal-profile:create', 'Criar perfis fiscais', 'Cria perfis fiscais da filial.'),
  ('branch-fiscal-profile:update', 'Atualizar perfis fiscais', 'Atualiza perfis fiscais da filial.'),
  ('branch-fiscal-profile:confirm', 'Confirmar perfis fiscais', 'Confirma perfis fiscais da filial.'),
  ('branch-fiscal-profile:deactivate', 'Desativar perfis fiscais', 'Desativa perfis fiscais da filial.'),
  ('protheus-parameter-mapping:read', 'Ler mapeamentos Protheus', 'Consulta mapeamentos de parametros Protheus.'),
  ('protheus-parameter-mapping:create', 'Criar mapeamentos Protheus', 'Cria mapeamentos de parametros Protheus.'),
  ('protheus-parameter-mapping:validate', 'Validar mapeamentos Protheus', 'Valida mapeamentos de parametros Protheus.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'company:read', 'company:create', 'company:update', 'company:deactivate',
  'branch:read', 'branch:create', 'branch:update', 'branch:deactivate',
  'environment:read', 'environment:create', 'environment:update', 'environment:deactivate',
  'branch-fiscal-profile:read', 'branch-fiscal-profile:create', 'branch-fiscal-profile:update',
  'branch-fiscal-profile:confirm', 'branch-fiscal-profile:deactivate',
  'protheus-parameter-mapping:read', 'protheus-parameter-mapping:create',
  'protheus-parameter-mapping:validate'
)
WHERE roles.code = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'company:read', 'company:create', 'company:update',
  'branch:read', 'branch:create', 'branch:update',
  'environment:read', 'environment:create', 'environment:update',
  'branch-fiscal-profile:read', 'branch-fiscal-profile:create', 'branch-fiscal-profile:update',
  'protheus-parameter-mapping:read', 'protheus-parameter-mapping:create'
)
WHERE roles.code = 'CONSULTANT'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'company:read', 'branch:read', 'environment:read',
  'branch-fiscal-profile:read', 'branch-fiscal-profile:create',
  'branch-fiscal-profile:update', 'branch-fiscal-profile:confirm',
  'protheus-parameter-mapping:read', 'protheus-parameter-mapping:validate'
)
WHERE roles.code = 'TAX_ANALYST'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'company:read', 'branch:read', 'environment:read',
  'branch-fiscal-profile:read', 'branch-fiscal-profile:confirm',
  'protheus-parameter-mapping:read'
)
WHERE roles.code = 'APPROVER'
ON CONFLICT DO NOTHING;

INSERT INTO app.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM app.roles
JOIN app.permissions ON permissions.code IN (
  'company:read', 'branch:read', 'environment:read',
  'branch-fiscal-profile:read', 'protheus-parameter-mapping:read'
)
WHERE roles.code = 'VIEWER'
ON CONFLICT DO NOTHING;

ALTER TABLE app.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.companies FORCE ROW LEVEL SECURITY;
ALTER TABLE app.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.branches FORCE ROW LEVEL SECURITY;
ALTER TABLE app.branch_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.branch_addresses FORCE ROW LEVEL SECURITY;
ALTER TABLE app.protheus_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.protheus_environments FORCE ROW LEVEL SECURITY;
ALTER TABLE app.branch_fiscal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.branch_fiscal_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE app.protheus_parameter_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.protheus_parameter_mappings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_tenant_isolation ON app.companies;
CREATE POLICY companies_tenant_isolation ON app.companies
  FOR ALL USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());

DROP POLICY IF EXISTS branches_tenant_isolation ON app.branches;
CREATE POLICY branches_tenant_isolation ON app.branches
  FOR ALL USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());

DROP POLICY IF EXISTS branch_addresses_tenant_isolation ON app.branch_addresses;
CREATE POLICY branch_addresses_tenant_isolation ON app.branch_addresses
  FOR ALL USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());

DROP POLICY IF EXISTS protheus_environments_tenant_isolation ON app.protheus_environments;
CREATE POLICY protheus_environments_tenant_isolation ON app.protheus_environments
  FOR ALL USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());

DROP POLICY IF EXISTS branch_fiscal_profiles_tenant_isolation ON app.branch_fiscal_profiles;
CREATE POLICY branch_fiscal_profiles_tenant_isolation ON app.branch_fiscal_profiles
  FOR ALL USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());

DROP POLICY IF EXISTS protheus_parameter_mappings_tenant_isolation ON app.protheus_parameter_mappings;
CREATE POLICY protheus_parameter_mappings_tenant_isolation ON app.protheus_parameter_mappings
  FOR ALL USING (organization_id = app_private.current_organization_id())
  WITH CHECK (organization_id = app_private.current_organization_id());
