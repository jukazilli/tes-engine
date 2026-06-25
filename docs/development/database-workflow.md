# Database workflow

Start local infrastructure first:

```powershell
pnpm infra:up
pnpm infra:status
```

Initialize or rotate the runtime role:

```powershell
pnpm db:bootstrap
```

Apply migrations:

```powershell
pnpm db:migrate
```

Validate state:

```powershell
pnpm db:check
pnpm db:validate
pnpm db:status
```

Run database tests:

```powershell
pnpm test:db
pnpm test:db:rls
```

Generate Drizzle migrations from schema changes:

```powershell
pnpm db:generate
```

Review generated SQL before applying it. Migration files are immutable after being applied because
`pnpm db:check` compares stored checksums against files in `infrastructure/database/migrations`.

Do not use `docker compose down --volumes` for routine database work. The local scripts do not
remove PostgreSQL volumes.

Local `.env.local` files created before the database foundation may still point `DATABASE_URL` to
the migration role. Update local values manually so runtime API execution uses `POSTGRES_APP_USER`;
do not commit `.env.local`.
