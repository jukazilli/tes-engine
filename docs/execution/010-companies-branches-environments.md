# Prompt 10: Companies, branches and Protheus environments

Data: 2026-06-25

## 1. Status

Concluido.

## 2. Estado inicial

Base confirmada no commit:

```text
e672bc5 feat(organizations): implement memberships invitations and rbac
```

Worktree inicial limpo. Infraestrutura local saudavel. Relatorio do Prompt 09 presente em
`docs/execution/009-organizations-rbac.md`.

## 3. Diagnostico do build flaky

`backend-database:build` foi executado tres vezes isoladamente com cache e passou nas tres, mantendo
apenas o aviso do Nx de task flaky. Duracoes registradas: 10s, 4s e 4s. Depois de `pnpm nx reset`, a
execucao real passou em 36s sem reproduzir falha. Nenhum retry automatico, desativacao de cache ou
alteracao de CI foi feito. Risco mantido como monitorado.

## 4. Migration

Criada e aplicada:

```text
infrastructure/database/migrations/0004_companies_branches_protheus_environments_and_fiscal_profiles.sql
```

Ela cria `app.companies`, `app.branches`, `app.branch_addresses`, `app.protheus_environments`,
permissions, matriz de roles, constraints, triggers, indices e RLS.

## 5. Bibliotecas

- `@tes-engine/backend/companies`
- `@tes-engine/backend/protheus-environments`

Tags: `scope:backend`, `type:feature`, `platform:node`.

## 6. Empresas

Implementado cadastro, consulta, atualizacao com optimistic locking e desativacao logica. A raiz do
CNPJ e armazenada sem pontuacao e deve ser unica por organizacao enquanto ativa.

## 7. Filiais e enderecos

Implementado cadastro de filial com CNPJ validado, raiz conferida contra a empresa e endereco fiscal
criado na mesma transacao. O banco tambem bloqueia divergencia de raiz e relacoes cross-tenant por
FK composta.

## 8. Ambientes Protheus

Implementados ambientes por filial com tipo controlado, produto `PROTHEUS`, release e codigos como
texto. Nenhuma credencial, URL interna ou conexao Protheus foi armazenada.

## 9. Permissoes e papeis

Permissoes adicionadas:

- `company:*` explicitas;
- `branch:*` explicitas;
- `environment:*` explicitas.

`ADMIN` recebeu todas. `CONSULTANT` pode criar e atualizar, mas nao desativar. `TAX_ANALYST`,
`APPROVER` e `VIEWER` receberam leitura.

## 10. RLS e isolamento

RLS e `FORCE ROW LEVEL SECURITY` habilitados nas novas tabelas. Policies usam
`organization_id = app_private.current_organization_id()`. `pnpm test:db:rls` cobre visibilidade
tenant-scoped de empresas.

## 11. Paginacao e locking

Listagens usam cursor opaco, limite padrao 25 e maximo 100. Updates exigem `version` e retornam
`VERSION_CONFLICT` quando a versao nao bate.

## 12. Erros e logs

Foram adicionados codigos estaveis para CNPJ invalido, duplicidades, mismatch de raiz, dependencias
ativas e conflito de versao. Logs estruturados registram eventos sem payload integral, CNPJ completo
mascarado ou endereco completo.

## 13. OpenAPI

Controllers Nest com decorators Swagger foram adicionados para empresas, filiais e ambientes.
`pnpm openapi:validate` passou.

## 14. Testes

Scripts adicionados:

- `pnpm test:companies`
- `pnpm test:branches`
- `pnpm test:protheus-environments`
- `pnpm test:master-data`

Tambem passaram `pnpm test`, `pnpm test:db:rls` e validadores de banco.

## 15. Validacao manual

Validacao manual HTTP completa nao foi repetida neste corte durante a retomada. A cobertura
automatizada validou migration, RLS, permissions, validators, typecheck, lint, build e OpenAPI.

## 16. Resultado dos gates

Executados e aprovados durante o corte:

- `pnpm install --frozen-lockfile`
- `pnpm db:migrate`
- `pnpm db:check`
- `pnpm db:validate`
- `pnpm test:db:rls`
- `pnpm test:companies`
- `pnpm test:branches`
- `pnpm test:protheus-environments`
- `pnpm test:master-data`
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

Tambem executados e aprovados apos a criacao do relatorio:

- `pnpm quality`
- `pnpm run ci`

## 17. Pendencias e riscos

- Aviso Jest worker apareceu em `pnpm test`, sem falhar a suite.
- `backend-database:build` segue marcado pelo Nx como risco monitorado quando cacheado.
- Validacao estadual especifica de inscricao estadual ficou fora do corte.

## 18. Git

Commit criado:

```text
feat(master-data): add companies branches and protheus environments
```

Nao foi feito push.

## 19. Segredos e dados reais

Nenhum segredo, credencial Protheus, XML fiscal, dado fiscal real ou arquivo fora do projeto foi
incluido.

## 20. Recomendacao para o Prompt 11

Avancar para estrategia tributaria somente usando perfil fiscal confirmado e vigente da filial, sem
tratar `companies.tax_regime` como fonte definitiva.
