# Database foundation

The TES Engine persistence foundation uses PostgreSQL as the primary database and Drizzle ORM as the
typed schema layer.

## Project

Database code lives in `libs/backend/database` as the Nx project `backend-database`.

Tags:

- `scope:backend`
- `type:data-access`
- `platform:node`

Public import:

```typescript
import { DatabaseModule } from '@tes-engine/backend/database';
```

## Runtime and migration roles

The project separates privileged migration access from application runtime access.

| Variable                 | Purpose                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| `DATABASE_MIGRATION_URL` | Used only by migration/bootstrap scripts. It may own schemas and apply DDL. |
| `DATABASE_URL`           | Used by the API runtime. It must point to the least-privilege runtime role. |
| `POSTGRES_APP_USER`      | Runtime role name created by `pnpm db:bootstrap`.                           |
| `POSTGRES_APP_PASSWORD`  | Runtime role password.                                                      |

The runtime role is configured as `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE` and `NOBYPASSRLS`. It
receives DML privileges on the `app` schema and execute privileges on tenant-context functions.

## Schemas

| Schema        | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `app`         | Application tables exposed to the runtime role.  |
| `app_private` | Migration metadata and private helper functions. |

## Tables

Initial tables:

- `app.users`
- `app.organizations`
- `app.organization_memberships`

Tenant-scoped tables enable and force PostgreSQL RLS:

- `app.organizations`
- `app.organization_memberships`

`app.users` is intentionally not tenant-scoped because a user can belong to multiple organizations.

## API health

`GET /api/health/live` is process-only.

`GET /api/health/ready` checks the PostgreSQL runtime pool with `SELECT 1`. It returns `ready` only
when the application is initialized and the database check succeeds; otherwise it returns
`not_ready` with HTTP 503.
