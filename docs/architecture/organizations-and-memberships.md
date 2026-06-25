# Organizations and memberships

Status: ACCEPTED

## Escopo

O corte de organizacoes cria a fronteira multi-tenant inicial do TES Engine. Ele cobre somente:

- organizacoes;
- memberships;
- roles de sistema;
- convites;
- autorizacao por permissao.

Empresas, filiais, ambientes Protheus, projetos, wizard, arquivos, XML, motor fiscal, cenarios e
exportacoes continuam fora deste corte.

## Modulo

Implementacao backend:

```text
libs/backend/organizations
```

API publica Nx:

```text
@tes-engine/backend/organizations
```

Tags:

- `scope:backend`
- `type:feature`
- `platform:node`

## Entidades

- `app.organizations`
- `app.organization_memberships`
- `app.roles`
- `app.permissions`
- `app.role_permissions`
- `app.membership_roles`
- `app.organization_invitations`

## Endpoints

- `POST /api/organizations`
- `GET /api/organizations`
- `GET /api/organizations/:organizationId`
- `PATCH /api/organizations/:organizationId`
- `POST /api/organizations/:organizationId/deactivate`
- `GET /api/organizations/:organizationId/members`
- `PATCH /api/organizations/:organizationId/members/:membershipId`
- `DELETE /api/organizations/:organizationId/members/:membershipId`
- `PUT /api/organizations/:organizationId/members/:membershipId/roles`
- `POST /api/organizations/:organizationId/invitations`
- `GET /api/organizations/:organizationId/invitations`
- `POST /api/organizations/:organizationId/invitations/:invitationId/resend`
- `DELETE /api/organizations/:organizationId/invitations/:invitationId`
- `GET /api/organization-invitations/preview`
- `POST /api/organization-invitations/accept`

## Criacao

Ao criar uma organizacao, o usuario autenticado recebe membership `ACTIVE` e role `ADMIN`. A criacao
e executada com contexto tenant transacional.

## Protecoes

- Organizacao tenant-scoped exige `X-Organization-ID`.
- Header e parametro de rota devem bater.
- Operacoes mutaveis autenticadas exigem CSRF.
- RLS continua habilitado com `FORCE ROW LEVEL SECURITY`.
- Catalogos de roles e permissions nao sao alterados pelo runtime.
