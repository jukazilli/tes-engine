# TES Engine

TES Engine e um SaaS B2B para analise de XMLs de NF-e, consolidacao de cenarios de TES e geracao futura de arquivos para importacao no TOTVS Protheus por meio do MILE.

Este repositorio contem somente a baseline tecnica do Prompt 01. Banco de dados, Redis, armazenamento de objetos, upload, parser XML, regras fiscais, autenticacao, wizard e exportacoes ficam para cortes posteriores.

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
pnpm lint
pnpm test
pnpm build
pnpm build:web
pnpm build:api
pnpm build:worker
pnpm affected:lint
pnpm affected:test
pnpm graph
```

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

## Proximo passo

O Prompt 02 deve configurar PostgreSQL, Redis, MinIO e Mailpit localmente. Nada disso esta instalado ou configurado neste corte.
