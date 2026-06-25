# Visao de containers

Status: ACCEPTED

```mermaid
flowchart TB
  browser[Angular SPA]
  api[NestJS API]
  worker[NestJS Worker]
  postgres[(PostgreSQL)]
  redis[(Redis)]
  storage[(Object storage)]
  mailpit[Mailpit local]

  browser -->|HTTPS futuro / HTTP local| api
  api --> postgres
  api --> redis
  api --> storage
  api --> worker
  worker --> postgres
  worker --> redis
  worker --> storage
  api --> mailpit
```

## Responsabilidades

- Angular SPA: experiencia de usuario.
- NestJS API: validacao, autorizacao futura e orquestracao.
- NestJS Worker: processamento futuro sem exposicao publica.
- PostgreSQL: persistencia relacional futura.
- Redis: infraestrutura futura para cache ou filas.
- Object storage: arquivos originais e artefatos.
- Mailpit: e-mail local apenas para desenvolvimento.

Documentos relacionados:

- [Infraestrutura local](local-infrastructure.md)
- [Fluxo de dados](data-flow-overview.md)
