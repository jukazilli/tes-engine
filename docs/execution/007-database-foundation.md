# Prompt 07: Database foundation

Status: concluido.

## Escopo entregue

- Criada a biblioteca `backend-database` em `libs/backend/database`.
- Adicionado alias publico `@tes-engine/backend/database`.
- Instalados `drizzle-orm`, `drizzle-kit`, `pg` e `@types/pg`.
- Criado `drizzle.config.ts`.
- Criada a migracao `infrastructure/database/migrations/0000_database_foundation.sql`.
- Criados schemas PostgreSQL `app` e `app_private`.
- Criadas tabelas iniciais:
  - `app.users`;
  - `app.organizations`;
  - `app.organization_memberships`.
- Habilitado e forçado RLS em tabelas tenant-scoped:
  - `app.organizations`;
  - `app.organization_memberships`.
- Criadas policies tenant-aware usando:
  - `app_private.current_organization_id()`;
  - `app_private.current_user_id()`.
- Separadas URLs:
  - `DATABASE_MIGRATION_URL` para bootstrap/migracoes;
  - `DATABASE_URL` para runtime da API.
- Criado role runtime least-privilege via `pnpm db:bootstrap`.
- Atualizado readiness da API para consultar PostgreSQL runtime com `SELECT 1`.
- Mantido liveness sem dependencia externa.
- Atualizado CI com servico PostgreSQL e gates de banco.
- Documentados arquitetura, RLS, workflow local e ADRs 018-021.

## Scripts adicionados

- `pnpm db:bootstrap`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:check`
- `pnpm db:validate`
- `pnpm db:status`
- `pnpm test:db`
- `pnpm test:db:integration`
- `pnpm test:db:rls`
- `pnpm quality:database`

## Observacoes

O arquivo `.env.local` nao foi editado. Scripts de banco tratam `.env.example` como default fraco e
derivam a URL runtime com `POSTGRES_APP_USER` quando detectam configuracao local antiga apontando
`DATABASE_URL` para o usuario de migracao.

Para executar a API localmente fora dos scripts, `DATABASE_URL` em `.env.local` deve apontar para o
role runtime criado por `pnpm db:bootstrap`.

## Validacoes executadas

- `pnpm db:bootstrap`
- `pnpm db:migrate`
- `pnpm db:check`
- `pnpm db:validate`
- `pnpm test:db`
- `pnpm test:db:rls`
- `pnpm quality:database`
- `pnpm format:check`
- `pnpm docs:validate`
- `pnpm architecture:validate`
- `pnpm architecture:boundaries`
- `pnpm typecheck:coverage`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm openapi:validate`
- `pnpm quality`
- `pnpm run ci`
- `pnpm ci:validate`
- `pnpm infra:status`

`pnpm ci` literal foi executado e falhou pelo builtin nao implementado do pnpm 9.11.0
(`ERR_PNPM_CI_NOT_IMPLEMENTED`). O script local validado e `pnpm run ci`.

## Teste operacional de readiness

Foi executado teste manual controlado:

- API pronta com PostgreSQL ativo: HTTP 200 em `/api/health/ready`.
- Apenas o container `tes-engine-postgres` foi parado com `docker stop`.
- API permaneceu viva e retornou HTTP 503 em `/api/health/ready`.
- Apenas o container `tes-engine-postgres` foi iniciado novamente com `docker start`.
- PostgreSQL voltou para estado `healthy`.

Nenhum volume foi removido.

## Resultado

Fundacao PostgreSQL multi-tenant concluida com Drizzle, migracoes, RLS, role runtime limitado,
readiness de banco, CI e documentacao.
