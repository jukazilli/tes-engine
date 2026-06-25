# ADR-017 - OpenAPI

## Status

ACCEPTED

## Data

2026-06-25

## Decisores

- Engenharia

## Contexto

A API precisa publicar documentacao tecnica para health checks, contrato de erro e correlation ID
sem introduzir versionamento de URI ou autenticacao de documentacao neste corte.

## Forcas de decisao

- O frontend precisa consultar contratos HTTP previsiveis.
- O documento deve ser validavel no pipeline local.
- A documentacao deve poder ser desabilitada no futuro em producao.

## Alternativas

1. Documentar rotas apenas em Markdown.
2. Gerar OpenAPI com `@nestjs/swagger`.

## Decisao

Usar `@nestjs/swagger`, expor `/api/docs` e `/api/docs-json`, documentar Health, erro padronizado e
header de correlation ID. Validar o JSON com `pnpm openapi:validate`.

## Consequencias positivas

- Documento gerado a partir da aplicacao real.
- Health e erro ficam visiveis para consumidores.
- Pipeline local verifica paths e schemas essenciais.

## Consequencias negativas

- DTOs de OpenAPI duplicam parte de contratos compartilhados de forma intencional para manter
  decorators fora de `libs/shared/contracts`.

## Riscos

- Endpoints futuros podem esquecer decorators ou respostas de erro documentadas.

## Relacoes

- Substitui: nenhum.
- Substituido por: nenhum.
- Relacionado a: [API foundation](../architecture/api-foundation.md)
