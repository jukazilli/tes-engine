# Visao geral do sistema

Status: ACCEPTED

TES Engine usa monolito modular em monorepo Nx. A aplicacao e separada em web, API, worker,
bibliotecas compartilhadas e engines independentes de framework.

## Containers principais

- Web: SPA Angular com PO UI.
- API: NestJS publica para HTTP.
- Worker: NestJS sem porta publica.
- PostgreSQL: banco relacional local previsto como primario.
- Redis: infraestrutura local para caching ou filas futuras.
- Object storage: MinIO local para arquivos.
- Mailpit: e-mail local de desenvolvimento.

## Decisoes centrais

- Engines nao dependem de Angular, PO UI ou NestJS.
- Frontend nao contem regra fiscal.
- Backend orquestra casos de uso futuros.
- Shared contem contratos e tipos portaveis.
- Processamento assincrono e previsto, mas BullMQ ainda nao foi implementado.

Documentos relacionados:

- [Contexto do sistema](system-context.md)
- [Containers](container-view.md)
- [Module boundaries](module-boundaries.md)
