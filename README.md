# TES Engine

TES Engine e um SaaS B2B para analise de XMLs de NF-e, consolidacao de cenarios de TES e geracao
futura de arquivos para importacao no TOTVS Protheus por meio do MILE.

Este repositorio contem a baseline tecnica dos Prompts 01 a 03. Banco de dados local, Redis, MinIO,
Mailpit e fronteiras Nx estao configurados. ORM, migrations, entidades, upload, parser XML, regras
fiscais, autenticacao, wizard e exportacoes ficam para cortes posteriores.

Portal principal de documentacao: [`docs/README.md`](docs/README.md).

## Pre-requisitos

- Node.js 22.12.0
- Corepack 0.29.4
- pnpm 9.11.0
- Git 2.41.0 ou superior

## Versoes principais

- Nx 23.0.1
- Angular 21.2.17
- PO UI 21.21.0
- NestJS 11.1.27
- TypeScript 5.9.3
- RxJS 7.8.2
- Zone.js 0.15.1

## Instalacao

```powershell
corepack enable
pnpm install
```

## Desenvolvimento

```powershell
pnpm dev:web
pnpm dev:api
pnpm dev:worker
```

Servicos locais:

- Web: `http://localhost:4200`
- API: `http://localhost:3000/api`
- Health check: `http://localhost:3000/api/health`

## Qualidade

```powershell
pnpm format:check
pnpm docs:validate
pnpm architecture:validate
pnpm architecture:boundaries
pnpm lint
pnpm test
pnpm build
pnpm quality
pnpm ci:validate
pnpm build:web
pnpm build:api
pnpm build:worker
pnpm affected:lint
pnpm affected:test
pnpm graph
```

`pnpm quality` executa formatacao, validacoes arquiteturais, lint, testes e build em sequencia. O CI
usa a mesma base sem exigir Docker ou servicos locais.

Ordem recomendada de leitura:

1. [`docs/governance/source-of-truth.md`](docs/governance/source-of-truth.md)
2. [`docs/product/product-vision.md`](docs/product/product-vision.md)
3. [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md)
4. [`docs/architecture/module-catalog.md`](docs/architecture/module-catalog.md)
5. [`docs/domain/ubiquitous-language.md`](docs/domain/ubiquitous-language.md)

## Estrutura inicial

```text
apps/
  web/
  api/
  worker/
libs/
  frontend/
    shell/
    ui/
  backend/
    common/
  shared/
    contracts/
    domain-types/
    testing/
  engines/
    core/
docs/
  architecture/
  adr/
  execution/
infrastructure/
tools/
```

## Regras de separacao

- A logica fiscal e de consolidacao de TES nao deve ser implementada no frontend.
- O frontend pode consumir contratos compartilhados, mas nao pode importar backend.
- O backend pode usar libs compartilhadas e engines.
- Engines devem permanecer independentes de Angular, NestJS e PO UI.
- Shared deve conter contratos e tipos reutilizaveis, sem dependencia de camadas superiores.
- Fronteiras Nx, aliases publicos e restricoes por plataforma estao documentados em
  `docs/architecture/module-boundaries.md`.

## Contribuicao

Use Conventional Commits. Husky, lint-staged e Commitlint validam arquivos staged e mensagens de
commit localmente. Veja `CONTRIBUTING.md` para fluxo completo, politica de secrets, PRs e definicao
de pronto.

A governanca documental esta definida em
[`docs/governance/source-of-truth.md`](docs/governance/source-of-truth.md) e validada por
`pnpm docs:validate`.

## Proximo passo

O Prompt 05 estabelece a governanca documental. O Prompt 06 deve continuar a evolucao incremental
sem antecipar ORM, migrations, autenticacao ou funcionalidades fiscais fora do escopo definido.
