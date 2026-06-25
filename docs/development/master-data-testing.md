# Testes de master data

Status: ACCEPTED

Comandos principais:

```powershell
pnpm test:companies
pnpm test:branches
pnpm test:protheus-environments
pnpm test:master-data
pnpm test:branch-fiscal-profiles
pnpm test:reference-data
pnpm test:db:rls
```

Use apenas dados ficticios. CNPJs de teste devem ser numericamente validos e nao representar
clientes reais. Testes tenant-scoped devem executar consultas dentro de transacao com
`app.current_organization_id`.

Listagens usam cursor opaco, limite padrao 25 e maximo 100.
