# Module map

## Apps

| App           | Tags                                                           | Responsabilidade                                                                       |
| ------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `apps/web`    | `scope:frontend`, `type:app`, `platform:browser`               | SPA Angular com PO UI, shell inicial, menu, toolbar e rota inicial.                    |
| `apps/api`    | `scope:backend`, `type:app`, `platform:node`                   | API NestJS com configuracao validada, logs estruturados, health, erros e OpenAPI.      |
| `apps/worker` | `scope:backend`, `type:app`, `platform:node`, `runtime:worker` | Processo NestJS separado, sem porta HTTP publica, preparado para processamento futuro. |

## Bibliotecas

| Biblioteca                 | Tags                                                  | Responsabilidade                                                                    |
| -------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `libs/frontend/shell`      | `scope:frontend`, `type:shell`, `platform:browser`    | Estrutura de shell e integracoes de navegacao do frontend.                          |
| `libs/frontend/ui`         | `scope:frontend`, `type:ui`, `platform:browser`       | Componentes visuais reutilizaveis do frontend.                                      |
| `libs/backend/common`      | `scope:backend`, `type:util`, `platform:node`         | Utilitarios comuns do backend.                                                      |
| `libs/backend/database`    | `scope:backend`, `type:data-access`, `platform:node`  | Conexao PostgreSQL, Drizzle schema, migracoes e helpers de contexto tenant.         |
| `libs/shared/contracts`    | `scope:shared`, `type:contracts`, `platform:agnostic` | Contratos tipados entre camadas.                                                    |
| `libs/shared/domain-types` | `scope:shared`, `type:domain`, `platform:agnostic`    | Tipos de dominio compartilhados sem dependencia de framework.                       |
| `libs/shared/testing`      | `scope:shared`, `type:testing`, `platform:agnostic`   | Utilitarios de teste compartilhados.                                                |
| `libs/engines/core`        | `scope:engine`, `type:domain`, `platform:agnostic`    | Base futura dos motores deterministas, sem dependencia de Angular, NestJS ou PO UI. |

## Dependencias permitidas

- `scope:frontend` pode depender de `scope:frontend` e `scope:shared`.
- `scope:backend` pode depender de `scope:backend`, `scope:shared` e `scope:engine`.
- `scope:engine` pode depender de `scope:engine` e `scope:shared`.
- `scope:shared` pode depender somente de `scope:shared`.

## Dependencias proibidas

- Frontend nao pode importar backend.
- Backend nao pode importar frontend.
- Engines nao podem depender de Angular, NestJS ou PO UI.
- Shared nao pode depender de apps, frontend, backend ou engines.
- Tipos de dominio nao devem depender de frameworks.

## Features futuras previstas

- Autenticacao e sessoes.
- Organizacoes, memberships e permissoes.
- Empresas, filiais e ambientes Protheus.
- Upload seguro, parser NF-e e normalizacao.
- BullMQ, workers e execucoes assincronas.
- Motor deterministico de regras.
- Revisao, aprovacao, auditoria e exportacoes.

## Regra central

O frontend apresenta fluxos e coleta interacoes. O backend orquestra casos de uso e integra
infraestrutura. Os contratos compartilhados definem fronteiras. Engines executam logica
deterministica sem depender de frameworks.
