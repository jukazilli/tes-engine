# Module map

## Apps

| App | Responsabilidade |
| --- | --- |
| `apps/web` | SPA Angular com PO UI, shell inicial, menu, toolbar e rota inicial. |
| `apps/api` | API NestJS com prefixo global `/api` e endpoint `GET /api/health`. |
| `apps/worker` | Processo NestJS separado, sem porta HTTP publica, preparado para processamento futuro. |

## Bibliotecas

| Biblioteca | Responsabilidade |
| --- | --- |
| `libs/frontend/shell` | Estrutura de shell e integracoes de navegacao do frontend. |
| `libs/frontend/ui` | Componentes visuais reutilizaveis do frontend. |
| `libs/backend/common` | Utilitarios comuns do backend. |
| `libs/shared/contracts` | Contratos tipados entre camadas. |
| `libs/shared/domain-types` | Tipos de dominio compartilhados sem dependencia de framework. |
| `libs/shared/testing` | Utilitarios de teste compartilhados. |
| `libs/engines/core` | Base futura dos motores deterministas, sem dependencia de Angular, NestJS ou PO UI. |

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

O frontend apresenta fluxos e coleta interacoes. O backend orquestra casos de uso e integra infraestrutura. Os contratos compartilhados definem fronteiras. Engines executam logica deterministica sem depender de frameworks.
