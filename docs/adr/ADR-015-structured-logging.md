# ADR-015 - Structured logging

## Status

ACCEPTED

## Data

2026-06-25

## Decisores

- Engenharia

## Contexto

A API precisa de logs operacionais estruturados, com correlation ID e redaction de dados sensiveis,
antes da entrada de upload, XML fiscal e regras de negocio.

## Forcas de decisao

- Logs precisam ser consumiveis por ferramentas de observabilidade.
- Dados fiscais e credenciais nao podem aparecer em logs.
- Desenvolvimento local deve continuar legivel.

## Alternativas

1. Usar `Logger` padrao do NestJS.
2. Usar Pino via `nestjs-pino`.

## Decisao

Usar `nestjs-pino`, `pino` e `pino-pretty` apenas para desenvolvimento local. Configurar redaction
para headers, tokens, senhas, secrets, XML e conteudo de arquivo.

## Consequencias positivas

- Logs em JSON por padrao.
- Correlation ID por requisicao.
- Redaction centralizada antes de modulos fiscais.

## Consequencias negativas

- Campos sensiveis novos precisam ser incluidos explicitamente na lista de redaction.

## Riscos

- Desenvolvedores podem logar payloads completos manualmente se ignorarem a regra documental.

## Relacoes

- Substitui: nenhum.
- Substituido por: nenhum.
- Relacionado a: [API foundation](../architecture/api-foundation.md)
