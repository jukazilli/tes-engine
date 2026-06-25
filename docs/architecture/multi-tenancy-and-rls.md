# Multi-tenancy and RLS

Tenant isolation is enforced in PostgreSQL, not only in application code.

## Tenant context

The application sets tenant context inside a transaction:

- `app.current_organization_id`
- `app.current_user_id`

The database exposes null-safe helpers:

- `app_private.current_organization_id()`
- `app_private.current_user_id()`

Malformed or missing context returns `NULL`; it does not expose rows.

## Policies

`app.organizations` policy:

```sql
id = app_private.current_organization_id()
```

`app.organization_memberships` policy:

```sql
organization_id = app_private.current_organization_id()
```

Both tables use `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`.

Prompt 09 extends this model to:

- `app.membership_roles`
- `app.organization_invitations`

Both tables also use `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`.

## Application pattern

Use `TenantTransactionService.withTenantTransaction` when a repository operation needs tenant-scoped
data. The helper validates UUIDs, opens a transaction and sets PostgreSQL context with `set_config`
using transaction-local scope.

## Verification

`pnpm test:db:rls` verifies that:

- runtime queries without tenant context return no tenant rows;
- tenant A can see tenant A only;
- tenant B can see tenant B only;
- invalid tenant context returns no rows;
- cross-tenant updates do not affect rows.

Organization authorization also uses:

- [Organization context](organization-context.md)
- [RBAC](rbac.md)
- [Tenant authorization](../security/tenant-authorization.md)
