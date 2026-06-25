# RBAC

Status: ACCEPTED

## Modelo

RBAC do Prompt 09 usa roles de sistema, permissions explicitas e atribuicoes por membership.

## Roles

- `ADMIN`
- `CONSULTANT`
- `TAX_ANALYST`
- `APPROVER`
- `VIEWER`

## Permissions

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

Nao existe wildcard permission.

## Autorizacao

Controllers declaram permissions com `@RequirePermissions(...)`. O `PermissionsGuard` nega por
padrao quando nao existe contexto de organizacao ou quando a permissao exigida nao aparece no
resultado de `app_private.permissions_for_user(user_id, organization_id)`.

## Catalogos

`roles`, `permissions` e `role_permissions` sao seedados por migration. A role runtime da API deve
ter leitura, mas nao deve ter `INSERT`, `UPDATE` ou `DELETE` nesses catalogos.

## Ultimo administrador

Operacoes de status, remocao e reatribuicao de roles preservam ao menos um `ADMIN` ativo na
organizacao.
