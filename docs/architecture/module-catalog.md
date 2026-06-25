# Catalogo de modulos

Status: ACCEPTED

## Modulos atuais

| Nome                | Caminho                    | Tags                                                           | Responsabilidade      | API publica                       |
| ------------------- | -------------------------- | -------------------------------------------------------------- | --------------------- | --------------------------------- |
| web                 | `apps/web`                 | `scope:frontend`, `type:app`, `platform:browser`               | SPA Angular           | Nao aplicavel                     |
| api                 | `apps/api`                 | `scope:backend`, `type:app`, `platform:node`                   | API NestJS            | HTTP futuro                       |
| worker              | `apps/worker`              | `scope:backend`, `type:app`, `platform:node`, `runtime:worker` | Processamento futuro  | Nao publica                       |
| frontend/shell      | `libs/frontend/shell`      | `scope:frontend`, `type:shell`, `platform:browser`             | Shell frontend        | `@tes-engine/frontend/shell`      |
| frontend/ui         | `libs/frontend/ui`         | `scope:frontend`, `type:ui`, `platform:browser`                | UI propria minima     | `@tes-engine/frontend/ui`         |
| backend/common      | `libs/backend/common`      | `scope:backend`, `type:util`, `platform:node`                  | Utilitarios backend   | `@tes-engine/backend/common`      |
| shared/contracts    | `libs/shared/contracts`    | `scope:shared`, `type:contracts`, `platform:agnostic`          | Contratos             | `@tes-engine/shared/contracts`    |
| shared/domain-types | `libs/shared/domain-types` | `scope:shared`, `type:domain`, `platform:agnostic`             | Tipos portaveis       | `@tes-engine/shared/domain-types` |
| shared/testing      | `libs/shared/testing`      | `scope:shared`, `type:testing`, `platform:agnostic`            | Testes compartilhados | `@tes-engine/shared/testing`      |
| engines/core        | `libs/engines/core`        | `scope:engine`, `type:domain`, `platform:agnostic`             | Motor puro futuro     | `@tes-engine/engines/core`        |

## Dependencias permitidas

Use a matriz definida em [module boundaries](module-boundaries.md).

## O que pertence

- `frontend/*`: elementos de experiencia e composicao browser.
- `backend/*`: utilitarios e adaptadores Node.
- `shared/*`: contratos e tipos portaveis.
- `engines/*`: regras deterministicas sem framework.

## O que nao pertence

- Regra fiscal no frontend.
- NestJS dentro de engines.
- PO UI dentro de backend.
- Persistencia fisica dentro de shared.

## Modulos futuros previstos

Identity, Organizations, Companies, Protheus Environments, Projects, Files, Fiscal Documents,
Processing, Rules, Scenarios, Protheus Matching, Review, Approval, Exports e Audit.
