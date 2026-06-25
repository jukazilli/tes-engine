# 004 - Quality gates and CI

Data: 2026-06-25

## 1. Status

Concluido.

Foram configurados padroes de runtime, formatacao, hooks Git, Commitlint, lint-staged, GitHub
Actions, validacao local de workflows, documentacao de contribuicao e estrategias de qualidade e
testes.

## 2. Estado inicial

Repositorio: `C:\projetos\tes-engine`

`git status --short` inicial: limpo.

Preflight executado:

```powershell
git status --short
git log --oneline -8
node --version
pnpm --version
pnpm architecture:validate
pnpm architecture:boundaries
pnpm lint
pnpm test
pnpm build
pnpm infra:status
```

Resultado: todos os comandos passaram.

## 3. Commit inicial encontrado

Commit inicial do Prompt 04:

```text
fdf0f95 chore: enforce nx module boundaries
```

Tambem estavam presentes:

```text
10ad406 chore: add local development infrastructure
60674b8 chore: bootstrap tes engine workspace
f8a54a1 Initial commit
```

## 4. Arquivos criados e modificados

Criados:

- `.github/workflows/ci.yml`
- `.github/pull_request_template.md`
- `.husky/pre-commit`
- `.husky/commit-msg`
- `.node-version`
- `.nvmrc`
- `CONTRIBUTING.md`
- `commitlint.config.mjs`
- `lint-staged.config.mjs`
- `tools/ci/validate-workflows.mjs`
- `docs/architecture/quality-strategy.md`
- `docs/architecture/testing-strategy.md`
- `docs/adr/ADR-011-quality-gates-and-ci.md`
- `docs/execution/004-quality-gates-and-ci.md`

Modificados:

- `package.json`
- `pnpm-lock.yaml`
- `.prettierrc`
- `.prettierignore`
- `README.md`
- arquivos existentes formatados por `pnpm format`

## 5. Dependencias adicionadas

| Pacote                            | Versao   |
| --------------------------------- | -------- |
| `husky`                           | `9.1.7`  |
| `lint-staged`                     | `17.0.8` |
| `@commitlint/cli`                 | `21.1.0` |
| `@commitlint/config-conventional` | `21.1.0` |
| `yaml`                            | `2.9.0`  |

Todas foram adicionadas como `devDependencies` com versao explicita.

## 6. Scripts adicionados

```text
format
format:check
quality:format
quality:architecture
quality:lint
quality:test
quality:build
quality
quality:ci
ci:validate
prepare
staged:check
commitlint
commitlint:last
```

`packageManager` foi definido como `pnpm@9.11.0`.

`engines`:

```json
{
  "node": ">=22.12.0 <23",
  "pnpm": ">=9.11.0 <10"
}
```

## 7. Configuracao do Prettier

Configuracao em `.prettierrc`:

- `singleQuote: true`
- `semi: true`
- `printWidth: 100`
- `trailingComma: all`
- `endOfLine: lf`
- `proseWrap: always` para Markdown

`.prettierignore` ignora builds, caches, imagens, ambientes locais, lockfile e artefatos gerados do
Nx Graph.

## 8. Configuracao do ESLint

As regras de module boundaries do Prompt 03 foram preservadas.

Nao houve migracao dos executores deprecated do Nx. O Prettier ficou responsavel por estilo e o
ESLint por qualidade e arquitetura.

## 9. Configuracao do lint-staged

Arquivo: `lint-staged.config.mjs`

Regras:

- TypeScript e JavaScript: `eslint --fix --max-warnings=0` e `prettier --write`;
- HTML, SCSS, CSS, JSON, Markdown e YAML: `prettier --write`.

## 10. Configuracao do Husky

Hooks:

- `.husky/pre-commit`: executa `lint-staged`;
- `.husky/commit-msg`: executa `commitlint --edit "$1"`.

Diretorio instalado:

```text
.husky/_
```

## 11. Configuracao do Commitlint

Arquivo: `commitlint.config.mjs`

Base:

```text
@commitlint/config-conventional
```

Tipos aceitos:

```text
feat
fix
docs
style
refactor
perf
test
build
ci
chore
revert
```

## 12. Resultado da mensagem valida

Mensagem testada:

```text
feat(projects): add project creation
```

Resultado: passou com exit code `0`.

## 13. Resultado da mensagem invalida

Mensagem testada:

```text
alteracoess
```

Resultado: falhou com exit code `1`, como esperado.

## 14. Resultado do teste do pre-commit

Foi criado um arquivo temporario staged em `tools/ci/__lint_staged_check__.md`, executado
`pnpm staged:check` e removido o arquivo no `finally` do teste manual.

Resultado:

```text
lint-staged: exit=0
pre-commit: no-build-command
```

O hook `pre-commit` nao contem `build`, `test` ou `nx run-many`.

## 15. Estrutura do workflow

Workflow criado em `.github/workflows/ci.yml`.

Eventos:

- `pull_request`;
- `push` para `main`, `develop` e `master`.

O branch `master` foi incluido porque e o branch local atual do repositorio.

Job principal:

- `ubuntu-latest`;
- timeout de 30 minutos;
- permissoes minimas `contents: read`;
- concorrencia com cancelamento de execucoes antigas;
- `actions/checkout@v4`;
- `actions/setup-node@v4`;
- Corepack;
- `pnpm@9.11.0`;
- `pnpm install --frozen-lockfile`;
- `pnpm format:check`;
- `pnpm architecture:validate`;
- `pnpm architecture:boundaries`;
- `pnpm lint`;
- `pnpm test`;
- `pnpm build`.

O workflow nao exige Docker, banco, Redis, MinIO, Mailpit, secrets ou deploy.

## 16. Resultado do ci:validate

`pnpm ci:validate`: passou.

Resultado:

```text
Workflows validos: 1 arquivo(s) verificado(s).
```

## 17. Resultado de format:check

`pnpm format:check`: passou.

## 18. Resultado de architecture:validate

`pnpm architecture:validate`: passou.

Resultado:

```text
Arquitetura validada: 10 projetos com tags, APIs publicas e imports consistentes.
```

## 19. Resultado de architecture:boundaries

`pnpm architecture:boundaries`: passou.

Resultado:

```text
Fronteiras validadas com fixtures temporarias: proibidas falham e permitidas passam.
```

## 20. Cleanup das fixtures

Foi verificado que nao restaram arquivos `__architecture_*` em `apps`, `libs` ou `tools`.

O teste controlado de lint-staged tambem removeu `tools/ci/__lint_staged_check__.md`.

## 21. Resultado do lint

`pnpm lint`: passou para os 10 projetos.

## 22. Resultado dos testes

`pnpm test`: passou para os 10 projetos.

## 23. Resultado dos builds

`pnpm build`: passou para os 10 projetos.

## 24. Resultado do quality

`pnpm quality`: passou.

O comando executa, em sequencia:

```text
quality:format
quality:architecture
quality:lint
quality:test
quality:build
```

## 25. Resultado de infra:status

`pnpm infra:status`: passou.

Servicos saudaveis:

- `tes-engine-postgres`
- `tes-engine-redis`
- `tes-engine-minio`
- `tes-engine-mailpit`

## 26. Avisos e deprecacoes

Avisos observados:

- `@nx/jest:jest` deprecated para Nx v24;
- `@nx/eslint:lint` deprecated para Nx v24;
- avisos de deprecacao de pacotes Angular ja presentes no ecossistema instalado;
- `HUSKY=0` estava ativo na sessao do Codex, entao `pnpm prepare` precisou ser executado uma vez com
  a variavel removida para instalar `.husky/_`.

Nenhum desses avisos bloqueou o corte.

## 27. Decisoes e desvios

- O CI principal nao executa Docker nem `infra:status`.
- `quality:ci` inclui `pnpm install --frozen-lockfile && pnpm quality`, mas o workflow executa
  install e etapas individualmente para logs mais claros.
- `pnpm format` formatou arquivos existentes para criar uma baseline real de Prettier.
- `pnpm-lock.yaml` foi ignorado pelo Prettier por ser artefato gerado pelo gerenciador de pacotes.
- O validador de workflow usa `yaml` como parser, nao apenas regex.

## 28. Riscos e pendencias

- Migrar executores deprecated do Nx em corte futuro.
- Avaliar secret scanning e dependency audit em corte futuro de seguranca.
- `architecture:boundaries` deve continuar sequencial e nao deve rodar em paralelo com lint.

## 29. Saida final de git status --short

Estado antes do commit do Prompt 04:

```text
M .prettierignore
M .prettierrc
M .vscode/launch.json
M README.md
M package.json
M pnpm-lock.yaml
M eslint.config.mjs
M tools/architecture/validate-boundary-fixtures.mjs
M tools/architecture/validate-project-tags.mjs
?? .github/pull_request_template.md
?? .github/workflows/ci.yml
?? .husky/commit-msg
?? .husky/pre-commit
?? .node-version
?? .nvmrc
?? CONTRIBUTING.md
?? commitlint.config.mjs
?? docs/adr/ADR-011-quality-gates-and-ci.md
?? docs/architecture/quality-strategy.md
?? docs/architecture/testing-strategy.md
?? docs/execution/004-quality-gates-and-ci.md
?? lint-staged.config.mjs
?? tools/ci/validate-workflows.mjs
```

Observacao: a lista acima resume os principais arquivos; outros arquivos existentes aparecem
modificados por formatacao Prettier.

## 30. Commit criado

Commit planejado:

```text
chore: add quality gates and ci
```

## 31. Escopo de arquivos

Nenhum arquivo fora de `C:\projetos\tes-engine` foi alterado.

## 32. Recomendacao para o Prompt 05

Prosseguir apenas com o proximo corte incremental definido, mantendo `pnpm quality` como gate
obrigatorio antes de commit ou PR.
