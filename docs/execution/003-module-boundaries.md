# 003 - Module boundaries

Data: 2026-06-25

## 1. Status

Concluido.

O monorepo passou a ter tags Nx completas, aliases publicos, APIs publicas explicitas nas
bibliotecas, regras ESLint/Nx de fronteira e validadores automatizados de arquitetura.

## 2. Estado inicial encontrado

Repositorio: `C:\projetos\tes-engine`

`git status --short` inicial:

```text
 D docs/execution/tes-engine-prompt-001-web.png
```

Preflight executado antes das alteracoes:

```powershell
git status --short
git log --oneline -5
pnpm infra:status
pnpm lint
pnpm test
pnpm build
```

Resultado do preflight: infraestrutura saudavel, lint passou, testes passaram e build passou.

## 3. Correcao do screenshot excluido

O arquivo `docs/execution/tes-engine-prompt-001-web.png` estava rastreado desde o commit
`60674b8 chore: bootstrap tes engine workspace`.

Como a exclusao nao tinha relacao com o Prompt 03, foi executado:

```powershell
git restore -- docs/execution/tes-engine-prompt-001-web.png
```

O arquivo foi restaurado e nao permaneceu marcado como excluido.

## 4. Commit base identificado

Commits presentes no inicio:

```text
10ad406 chore: add local development infrastructure
60674b8 chore: bootstrap tes engine workspace
f8a54a1 Initial commit
```

O Prompt 01 estava em `60674b8` e o Prompt 02 em `10ad406`.

## 5. Arquivos criados e alterados

Criados:

- `tools/architecture/validate-project-tags.mjs`
- `tools/architecture/validate-boundary-fixtures.mjs`
- `docs/architecture/module-boundaries.md`
- `docs/adr/ADR-008-nx-module-boundaries.md`
- `docs/adr/ADR-009-library-public-apis.md`
- `docs/adr/ADR-010-framework-independent-engines.md`
- `docs/execution/003-nx-graph.html`
- `docs/execution/static/*`
- `docs/execution/003-module-boundaries.md`

Alterados:

- `README.md`
- `package.json`
- `tsconfig.base.json`
- `eslint.config.mjs`
- `apps/api/project.json`
- `apps/api/src/app/app.service.ts`
- `apps/web/project.json`
- `apps/worker/project.json`
- `docs/architecture/module-map.md`
- `libs/**/project.json`
- `libs/**/src/lib/*.ts`
- `libs/**/src/lib/*.spec.ts`

## 6. Tags atribuidas

| Projeto               | Tags                                                           |
| --------------------- | -------------------------------------------------------------- |
| `web`                 | `scope:frontend`, `type:app`, `platform:browser`               |
| `api`                 | `scope:backend`, `type:app`, `platform:node`                   |
| `worker`              | `scope:backend`, `type:app`, `platform:node`, `runtime:worker` |
| `frontend-shell`      | `scope:frontend`, `type:shell`, `platform:browser`             |
| `frontend-ui`         | `scope:frontend`, `type:ui`, `platform:browser`                |
| `backend-common`      | `scope:backend`, `type:util`, `platform:node`                  |
| `shared-contracts`    | `scope:shared`, `type:contracts`, `platform:agnostic`          |
| `shared-domain-types` | `scope:shared`, `type:domain`, `platform:agnostic`             |
| `shared-testing`      | `scope:shared`, `type:testing`, `platform:agnostic`            |
| `engine-core`         | `scope:engine`, `type:domain`, `platform:agnostic`             |

## 7. Matriz final de dependencias

| Origem           | Pode depender de                                |
| ---------------- | ----------------------------------------------- |
| `scope:frontend` | `scope:frontend`, `scope:shared`                |
| `scope:backend`  | `scope:backend`, `scope:shared`, `scope:engine` |
| `scope:engine`   | `scope:engine`, `scope:shared`                  |
| `scope:shared`   | `scope:shared`                                  |

Dependencias proibidas:

- frontend para backend ou engine;
- backend para frontend;
- engine para frontend ou backend;
- shared para frontend, backend ou engine.

## 8. Regras configuradas no ESLint

`@nx/enforce-module-boundaries` foi mantido e reforcado em `eslint.config.mjs`.

Regras complementares:

- `platform:agnostic` nao pode importar Angular, PO UI ou NestJS;
- `platform:browser` nao pode importar APIs exclusivas de Node.js;
- `platform:node` nao pode importar PO UI;
- `type:ui` nao pode depender de `type:app`.

## 9. APIs publicas

Todas as bibliotecas existentes possuem `src/index.ts`.

APIs minimas mantidas:

- `@tes-engine/shared/contracts`: `HealthResponse`;
- `@tes-engine/shared/domain-types`: `EntityId`;
- `@tes-engine/shared/testing`: `createTestLabel`;
- `@tes-engine/engines/core`: `getEngineCoreInfo`;
- `@tes-engine/backend/common`: `normalizeServiceName`;
- `@tes-engine/frontend/shell`: `frontendShellMarker`;
- `@tes-engine/frontend/ui`: `frontendUiMarker`.

## 10. Aliases configurados

Aliases publicos:

```text
@tes-engine/frontend/shell
@tes-engine/frontend/ui
@tes-engine/backend/common
@tes-engine/shared/contracts
@tes-engine/shared/domain-types
@tes-engine/shared/testing
@tes-engine/engines/core
```

Aliases legados com hifen foram preservados temporariamente para compatibilidade, mas os novos
imports usam o padrao publico com barras.

## 11. Testes de dependencias permitidas

`pnpm architecture:boundaries` criou fixtures temporarias e confirmou:

- backend pode depender de shared;
- backend pode depender de engine;
- web pode depender de frontend e shared.

Resultado: passou.

## 12. Testes de dependencias proibidas

`pnpm architecture:boundaries` criou fixtures temporarias e confirmou:

- frontend nao pode depender de backend;
- shared nao pode depender de engine;
- engine nao pode depender de NestJS.

Resultado: passou.

## 13. Resultado de architecture:validate

```text
Arquitetura validada: 10 projetos com tags, APIs publicas e imports consistentes.
```

## 14. Resultado do lint

`pnpm lint`: passou para os 10 projetos.

Observacao: uma execucao intermediaria de lint falhou porque foi executada em paralelo com fixtures
temporarias invalidas. A execucao limpa e sequencial passou.

## 15. Resultado dos testes

`pnpm test`: passou para os 10 projetos.

## 16. Resultado dos builds

`pnpm build`: passou para os 10 projetos.

## 17. Resultado de quality

`pnpm quality`: passou.

O agregador executa:

```text
architecture:validate
architecture:boundaries
lint
test
build
```

## 18. Nx Graph

Gerado em:

```text
docs/execution/003-nx-graph.html
```

Assets do graph:

```text
docs/execution/static/
```

## 19. Estado da infraestrutura

`pnpm infra:status`: passou.

Servicos saudaveis:

- `tes-engine-postgres`
- `tes-engine-redis`
- `tes-engine-minio`
- `tes-engine-mailpit`

O `minio-init` permanece como servico de inicializacao ja concluido.

## 20. Peer dependency warnings

`pnpm list --depth 0` nao apresentou warnings de peer dependency. Permanecem os avisos conhecidos de
deprecacao dos executores `@nx/jest:jest` e `@nx/eslint:lint` para Nx v24.

## 21. Decisoes e desvios

- O screenshot excluido foi restaurado por estar rastreado e ser alheio ao Prompt 03.
- Foram mantidos aliases legados em `tsconfig.base.json` para compatibilidade, mas os aliases
  canonicos novos foram adicionados e documentados.
- A validacao de fronteiras usa fixtures temporarias removidas ao final.
- A validacao complementar em `tools/architecture/validate-project-tags.mjs` cobre regras que nao
  sao expressas apenas por tags Nx.
- Nenhuma feature futura foi implementada.

## 22. Pendencias

- Migrar futuramente executores Jest/ESLint deprecated quando isso for escopo de um corte proprio.
- Remover aliases legados com hifen quando nao houver mais risco de compatibilidade.

## 23. Riscos

- Fixtures temporarias de fronteira nao devem ser executadas em paralelo com `pnpm lint`, pois sao
  arquivos propositalmente invalidos enquanto existem.
- O Nx Graph gerou assets estaticos em `docs/execution/static/`; eles devem permanecer junto do HTML
  se o graph for aberto localmente.

## 24. Saida de git status --short

Estado antes do commit do Prompt 03:

```text
M  README.md
M  apps/api/project.json
M  apps/api/src/app/app.service.ts
M  apps/web/project.json
M  apps/worker/project.json
M  docs/architecture/module-map.md
M  eslint.config.mjs
M  libs/backend/common/project.json
M  libs/backend/common/src/lib/backend-common.spec.ts
M  libs/backend/common/src/lib/backend-common.ts
M  libs/engines/core/project.json
M  libs/engines/core/src/lib/engine-core.spec.ts
M  libs/engines/core/src/lib/engine-core.ts
M  libs/frontend/shell/project.json
M  libs/frontend/shell/src/lib/frontend-shell.spec.ts
M  libs/frontend/shell/src/lib/frontend-shell.ts
M  libs/frontend/ui/project.json
M  libs/frontend/ui/src/lib/frontend-ui.spec.ts
M  libs/frontend/ui/src/lib/frontend-ui.ts
M  libs/shared/contracts/project.json
M  libs/shared/contracts/src/lib/shared-contracts.spec.ts
M  libs/shared/contracts/src/lib/shared-contracts.ts
M  libs/shared/domain-types/project.json
M  libs/shared/domain-types/src/lib/shared-domain-types.spec.ts
M  libs/shared/domain-types/src/lib/shared-domain-types.ts
M  libs/shared/testing/project.json
M  libs/shared/testing/src/lib/shared-testing.spec.ts
M  libs/shared/testing/src/lib/shared-testing.ts
M  package.json
M  tsconfig.base.json
A  docs/adr/ADR-008-nx-module-boundaries.md
A  docs/adr/ADR-009-library-public-apis.md
A  docs/adr/ADR-010-framework-independent-engines.md
A  docs/architecture/module-boundaries.md
A  docs/execution/003-module-boundaries.md
A  docs/execution/003-nx-graph.html
A  docs/execution/static/environment.js
A  docs/execution/static/favicon.ico
A  docs/execution/static/main.js
A  docs/execution/static/runtime.js
A  docs/execution/static/styles.css
A  docs/execution/static/styles.js
A  tools/architecture/validate-boundary-fixtures.mjs
A  tools/architecture/validate-project-tags.mjs
```

## 25. Commit criado

Commit criado para este corte:

```text
chore: enforce nx module boundaries
```

## 26. .env.local

`.env.local` permaneceu ignorado e nao foi versionado.

## 27. Escopo de arquivos

Nenhum arquivo fora de `C:\projetos\tes-engine` foi alterado.

## 28. Recomendacao para o Prompt 04

Prosseguir somente com o proximo corte incremental definido, mantendo as fronteiras criadas aqui.
Nao antecipar ORM, migrations, autenticacao, upload, parser XML, regras fiscais, wizard ou
exportacoes.
