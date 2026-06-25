# 005a - Typecheck quality gate

Data: 2026-06-25

## 1. Status

Concluido.

## 2. Estado inicial

O reposititorio estava limpo exceto pelo relatorio bloqueado do Prompt 06:

```text
?? docs/execution/006-api-foundation.md
```

## 3. Commit base

```text
7f95e39 docs: establish documentation governance
```

## 4. Motivo do bloqueio do Prompt 06

O Prompt 06 exigia `pnpm typecheck`, mas esse script nao existia no `package.json`.

## 5. Tratamento do relatorio bloqueado

`docs/execution/006-api-foundation.md` foi preservado e renomeado para:

```text
docs/execution/006-attempt-1-api-foundation-blocked.md
```

Foi acrescentado o cabecalho:

```text
Status: BLOQUEADO NO PREFLIGHT
Tentativa: 1
Motivo: ausencia do script raiz typecheck
```

## 6. Tratamento do nome do relatorio 004

O nome canonico mantido foi:

```text
docs/execution/004-quality-gates-and-ci.md
```

Nao havia referencia versionada incorreta fora do relatorio historico bloqueado, onde a divergencia
foi preservada como evidencia da falha original do preflight.

## 7. Projetos Nx encontrados

```text
shared-domain-types
shared-contracts
backend-common
frontend-shell
shared-testing
engine-core
frontend-ui
worker
api
web
```

## 8. Estrategia de typecheck escolhida

- `web`: `ngc --noEmit` para TypeScript e templates Angular.
- `api` e `worker`: `tsc --noEmit` com `tsconfig.app.json`.
- Bibliotecas: `tsc --noEmit` com `tsconfig.lib.json`.
- Cobertura estrutural: `tools/quality/validate-typecheck-coverage.mjs`.

## 9. Target de cada projeto

| Projeto               | Target typecheck                                             |
| --------------------- | ------------------------------------------------------------ |
| `web`                 | `ngc -p apps/web/tsconfig.app.json --noEmit`                 |
| `api`                 | `tsc --noEmit -p apps/api/tsconfig.app.json`                 |
| `worker`              | `tsc --noEmit -p apps/worker/tsconfig.app.json`              |
| `frontend-shell`      | `tsc --noEmit -p libs/frontend/shell/tsconfig.lib.json`      |
| `frontend-ui`         | `tsc --noEmit -p libs/frontend/ui/tsconfig.lib.json`         |
| `backend-common`      | `tsc --noEmit -p libs/backend/common/tsconfig.lib.json`      |
| `shared-contracts`    | `tsc --noEmit -p libs/shared/contracts/tsconfig.lib.json`    |
| `shared-domain-types` | `tsc --noEmit -p libs/shared/domain-types/tsconfig.lib.json` |
| `shared-testing`      | `tsc --noEmit -p libs/shared/testing/tsconfig.lib.json`      |
| `engine-core`         | `tsc --noEmit -p libs/engines/core/tsconfig.lib.json`        |

## 10. Cobertura dos projetos

`pnpm typecheck:coverage` validou 10 projetos TypeScript cobertos.

## 11. Typecheck Angular

`pnpm nx run web:typecheck` passou apos restauracao dos testes negativos.

## 12. Typecheck de templates

Um binding temporario para `missingTemplateProperty` em `apps/web/src/app/app.html` falhou com
`TS2339`, confirmando validacao de templates Angular.

## 13. Typecheck da API

Um retorno temporario `status: 200` em `apps/api/src/app/app.service.ts` falhou com `TS2322`.

## 14. Typecheck do worker

`pnpm nx run worker:typecheck` passou.

## 15. Typecheck das bibliotecas

Todas as bibliotecas possuem target `typecheck`. `engine-core` foi validada tambem com teste
negativo.

## 16. Testes negativos executados

- Angular TypeScript.
- API NestJS.
- Engine independente.
- Template Angular.

## 17. Resultado de cada teste negativo

| Caso                | Resultado esperado                           |
| ------------------- | -------------------------------------------- |
| Angular TypeScript  | `web:typecheck` falhou com `TS2322`.         |
| API NestJS          | `api:typecheck` falhou com `TS2322`.         |
| Engine independente | `engine-core:typecheck` falhou com `TS2322`. |
| Template Angular    | `web:typecheck` falhou com `TS2339`.         |

## 18. Confirmacao de restauracao dos arquivos temporarios

Depois dos testes negativos, os arquivos temporarios foram restaurados e os targets individuais
passaram:

```text
pnpm nx run web:typecheck
pnpm nx run api:typecheck
pnpm nx run worker:typecheck
pnpm nx run engine-core:typecheck
```

## 19. Scripts adicionados

```text
typecheck
typecheck:coverage
quality:typecheck
quality:fast
ci
```

`quality` passou a incluir `quality:fast`, testes e build.

Observacao: no pnpm 9.11.0, o comando direto `pnpm ci` e interceptado por um builtin nao
implementado. O script raiz deve ser executado com `pnpm run ci`.

## 20. Alteracoes no workflow

GitHub Actions passou a executar:

```text
pnpm typecheck:coverage
pnpm typecheck
```

antes de lint, testes e build.

## 21. Cache Nx

Targets `typecheck` sao cacheaveis e usam `outputs: []`, pois executam com `--noEmit`.

## 22. Dependencias adicionadas

Nenhuma dependencia foi adicionada.

## 23. Resultado de `format:check`

Passou nas validacoes finais.

## 24. Resultado de `docs:validate`

Passou nas validacoes finais.

## 25. Resultado de `architecture:validate`

Passou nas validacoes finais.

## 26. Resultado de `architecture:boundaries`

Passou nas validacoes finais.

## 27. Resultado de `typecheck:coverage`

Passou e confirmou 10 projetos cobertos.

## 28. Resultado de `typecheck`

Passou para os 10 projetos.

## 29. Resultado do lint

Passou nas validacoes finais.

## 30. Resultado dos testes

Passou nas validacoes finais.

## 31. Resultado dos builds

Passou nas validacoes finais.

## 32. Resultado de `quality:fast`

Passou nas validacoes finais.

## 33. Resultado de `quality`

Passou nas validacoes finais.

## 34. Resultado de `ci`

`pnpm run ci` passou nas validacoes finais.

`pnpm ci` foi testado e falhou com `ERR_PNPM_CI_NOT_IMPLEMENTED`, por limitacao do pnpm 9.11.0. O
script `ci` permanece disponivel via `pnpm run ci`.

## 35. Estado da infraestrutura

`pnpm infra:status` passou nas validacoes finais.

## 36. Decisoes e desvios

- O build nao foi usado como substituto do typecheck.
- O Angular usa `ngc` para cobrir templates.
- Bibliotecas frontend ainda usam `tsc` porque nao contem templates Angular neste corte.
- O relatorio bloqueado do Prompt 06 foi preservado como tentativa historica.
- O comando direto `pnpm ci` nao e utilizavel no pnpm 9.11.0; foi adotado `pnpm run ci` para
  executar o script local.

## 37. Pendencias

- Reexecutar o Prompt 06.
- Se bibliotecas frontend passarem a conter componentes Angular, migrar seus targets para `ngc`.
- Caso o projeto precise obrigatoriamente de `pnpm ci` literal no futuro, avaliar upgrade controlado
  do pnpm ou wrapper fora deste corte.

## 38. Riscos

- Nx ainda emite avisos de deprecacao para executores de lint/test ja conhecidos de prompts
  anteriores.
- O typecheck principal nao substitui os testes de `tsconfig.spec.json`; Jest segue responsavel por
  arquivos de teste.
- `pnpm ci` literal continua indisponivel por comportamento do pnpm 9.11.0, apesar do script `ci`
  existir e rodar via `pnpm run ci`.

## 39. Saida de `git status --short`

Estado esperado antes do commit:

```text
M .github/workflows/ci.yml
M CONTRIBUTING.md
M README.md
M apps/api/project.json
M apps/web/project.json
M apps/worker/project.json
M docs/README.md
M docs/adr/README.md
M docs/architecture/quality-strategy.md
M docs/execution/README.md
M docs/roadmap/prompt-sequence.md
M libs/backend/common/project.json
M libs/engines/core/project.json
M libs/frontend/shell/project.json
M libs/frontend/ui/project.json
M libs/shared/contracts/project.json
M libs/shared/domain-types/project.json
M libs/shared/testing/project.json
M package.json
M tools/ci/validate-workflows.mjs
?? docs/adr/ADR-013-explicit-typechecking.md
?? docs/development/typechecking.md
?? docs/execution/005a-typecheck-quality-gate.md
?? docs/execution/006-attempt-1-api-foundation-blocked.md
?? tools/quality/validate-typecheck-coverage.mjs
```

## 40. Commit criado

Commit planejado:

```text
chore: repair typecheck quality gate
```

## 41. Confirmacao de ausencia de segredos

Nenhum segredo foi adicionado. `.env.local` nao foi incluido.

## 42. Confirmacao de escopo

Nenhum arquivo fora de `C:\projetos\tes-engine` foi alterado.

## 43. Recomendacao objetiva

Reexecutar o Prompt 06.
