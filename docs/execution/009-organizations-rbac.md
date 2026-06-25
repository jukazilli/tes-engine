# Prompt 09: Organizations, memberships, invitations and RBAC

Data: 2026-06-25

## 1. Status

Concluido.

## 2. Estado inicial

O prompt iniciou a partir do commit base:

```text
b2aaae5 feat(auth): complete secure session authentication
```

O worktree estava limpo no preflight. A pendencia anterior em `docs/product/mvp-scope.md` nao foi
tratada como bloqueante para este corte: ela correspondia a ajuste manual de escopo do produto e o
Prompt 09 foi executado apos a baseline completa passar.

## 3. Escopo

Implementado:

- organizacoes;
- memberships;
- roles de sistema;
- permissions explicitas;
- convites por e-mail;
- contexto tenant por `X-Organization-ID`;
- guards de autorizacao;
- protecao cross-tenant;
- protecao contra remocao do ultimo administrador ativo;
- migration `0003_organizations_roles_and_invitations.sql`;
- biblioteca `@tes-engine/backend/organizations`.

Fora do escopo deste corte:

- empresas e filiais;
- ambientes Protheus;
- projetos;
- wizard;
- Redis/BullMQ;
- upload/XML;
- motor fiscal;
- cenarios;
- exportacao;
- UI Angular completa.

## 4. Arquivos alterados

Principais areas:

- `libs/backend/organizations`
- `infrastructure/database/migrations/0003_organizations_roles_and_invitations.sql`
- `libs/backend/database/src/lib/schema/organizations.schema.ts`
- `apps/api/src/app/app.module.ts`
- `apps/api/src/config/*`
- `tools/database/*`
- `tools/architecture/validate-project-tags.mjs`
- `docs/adr/*`
- `docs/architecture/*`
- `docs/development/organization-testing.md`
- `docs/security/tenant-authorization.md`

## 5. Comandos executados

Preflight executado antes da implementacao:

- `git status --short`
- `git log --oneline -12`
- `pnpm infra:status`
- `pnpm db:check`
- `pnpm db:validate`
- `pnpm test:db`
- `pnpm test:db:rls`
- `pnpm test:auth`
- `pnpm test:email`
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

Diagnostico Jest API:

- `pnpm nx test api`
- `pnpm nx test api --skip-nx-cache --runInBand --detectOpenHandles`
- `pnpm nx test api --skip-nx-cache`

## 6. Validacoes

Validacoes executadas durante a implementacao:

- `pnpm db:migrate`
- `pnpm db:check`
- `pnpm db:validate`
- `pnpm test:db`
- `pnpm test:db:rls`
- `pnpm test:organizations`
- `pnpm test:rbac`
- `pnpm test:invitations`
- `pnpm test:tenant-authorization`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm architecture:validate`
- `pnpm architecture:boundaries`
- `pnpm build`
- `pnpm openapi:validate`

Validacao final completa:

- `pnpm install --frozen-lockfile`
- `pnpm infra:status`
- `pnpm db:check`
- `pnpm db:migrate`
- `pnpm db:validate`
- `pnpm test:db`
- `pnpm test:db:rls`
- `pnpm test:auth`
- `pnpm test:email`
- `pnpm test:organizations`
- `pnpm test:rbac`
- `pnpm test:invitations`
- `pnpm test:tenant-authorization`
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

## 7. Testes

Scripts adicionados:

- `pnpm test:organizations`
- `pnpm test:rbac`
- `pnpm test:invitations`
- `pnpm test:tenant-authorization`

Os testes cobrem lista fechada de permissions e metadata de `@RequirePermissions`. A validacao de
banco cobre RLS, grants, policies e funcoes de autorizacao.

Validacao manual por HTTP contra API local:

- health readiness;
- registro, ativacao local e login;
- criacao de organizacao;
- leitura tenant-scoped com `X-Organization-ID`;
- rejeicao de header ausente;
- rejeicao de mismatch entre rota e header;
- criacao e listagem de convite;
- preview de convite via token recebido no Mailpit;
- aceite de convite por usuario convidado;
- membership do convidado na organizacao;
- negacao de criacao de convite por usuario `VIEWER`.

Tokens, cookies, senhas e hashes nao foram registrados no relatorio.

## 8. Decisoes

- Organizacao nao e implicita na sessao.
- `X-Organization-ID` e obrigatorio em rotas tenant-scoped.
- Header e parametro `:organizationId` precisam bater.
- Roles e permissions sao catalogos seedados por migration.
- Runtime da API nao altera catalogos de roles, permissions e role_permissions.
- Convites armazenam somente hash de token.
- Ultimo administrador ativo e protegido.

ADRs criados:

- [ADR-023](../adr/ADR-023-explicit-organization-context.md)
- [ADR-024](../adr/ADR-024-system-roles-and-permissions.md)
- [ADR-025](../adr/ADR-025-organization-invitations.md)
- [ADR-026](../adr/ADR-026-security-definer-authorization-functions.md)
- [ADR-027](../adr/ADR-027-last-administrator-protection.md)

## 9. Desvios

O aviso de Jest worker foi investigado. Ele apareceu no baseline em saida cacheada/paralela, mas a
suite real sem cache com `--runInBand --detectOpenHandles` passou sem reportar handles abertos. O
aviso nao foi reproduzido em `pnpm nx test api --skip-nx-cache`.

`pnpm build` teve uma falha transiente de `EPERM` em artefato `dist` no Windows durante execucao
paralela. O build foi reexecutado e passou; o proprio Nx marcou a task como flaky.

## 10. Riscos

- Rate limiting de convites esta em memoria e deve migrar para armazenamento distribuido antes de
  multiplas instancias.
- O envio de convites usa um servico no modulo de organizacoes configurado com os mesmos providers
  SMTP/Resend/fake do corte de autenticacao. Ainda vale consolidar isso em um adapter de e-mail
  compartilhado.
- Os testes funcionais de API para todos os cenarios de RBAC ainda podem ser ampliados no proximo
  corte.

## 11. Pendencias

- Evoluir rate limiting para Redis quando Redis/BullMQ entrar no escopo.
- Adicionar cobertura funcional mais profunda de convites e memberships.
- Implementar empresas/filiais somente no corte proprio.

## 12. Git

Commit local esperado:

```text
feat(organizations): implement memberships invitations and rbac
```

## 13. Recomendacao para o proximo passo

Prosseguir para o proximo prompt sem antecipar empresas, Protheus, wizard, motor fiscal ou
exportacao. Esses pontos continuam relevantes para o produto, mas devem entrar em cortes separados
por complexidade.
