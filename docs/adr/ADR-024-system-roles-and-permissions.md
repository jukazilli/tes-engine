# ADR-024: System roles and permissions

Status: ACCEPTED

Data: 2026-06-25

## Contexto

O Prompt 09 precisa de RBAC simples para operacoes de organizacao, membros e convites, sem expor
roles customizaveis no MVP.

## Decisao

Usar roles de sistema versionadas por migration e permissions explicitas. Roles e permissions sao
catalogos geridos por migration; o runtime da API pode ler, mas nao alterar esses catalogos.

Roles iniciais:

- `ADMIN`
- `CONSULTANT`
- `TAX_ANALYST`
- `APPROVER`
- `VIEWER`

Permissions iniciais:

- `organization:read`
- `organization:update`
- `organization:deactivate`
- `membership:read`
- `membership:invite`
- `membership:update`
- `membership:remove`
- `invitation:read`
- `invitation:create`
- `invitation:resend`
- `invitation:revoke`
- `role:read`
- `role:assign`

## Consequencias

- Nao ha wildcard permission.
- A autorizacao e deny-by-default.
- Alterar matriz de permissoes exige nova migration.
- O ultimo administrador ativo nao pode perder a capacidade administrativa.

## Relacoes

- Relacionado a: [ADR-023](ADR-023-explicit-organization-context.md)
- Relacionado a: [ADR-027](ADR-027-last-administrator-protection.md)
