# ADR-014 - API error contract

## Status

ACCEPTED

## Data

2026-06-25

## Decisores

- Engenharia

## Contexto

A API NestJS precisa expor erros estaveis para o frontend sem vazar stack trace, caminho local,
variaveis, credenciais ou detalhes de infraestrutura.

## Forcas de decisao

- O frontend precisa tratar erros por codigos previsiveis.
- Logs internos precisam manter correlation ID para diagnostico.
- Erros de validacao precisam apontar campos.
- Erros internos nao podem revelar detalhes sensiveis.

## Alternativas

1. Usar o formato padrao do NestJS.
2. Padronizar todos os erros por filtro global.

## Decisao

Usar filtro global e contrato framework-agnostic com `statusCode`, `code`, `message`, `timestamp`,
`path`, `method`, `correlationId` e `fieldErrors` opcional.

## Consequencias positivas

- Contrato previsivel para consumidores.
- 404 e validacao seguem a mesma estrutura.
- Erros internos podem ser logados sem vazar detalhes ao cliente.

## Consequencias negativas

- O filtro global precisa ser mantido quando novos tipos de excecao forem criados.

## Riscos

- Novos endpoints podem tentar retornar erros manuais fora do filtro.

## Relacoes

- Substitui: nenhum.
- Substituido por: nenhum.
- Relacionado a: [API foundation](../architecture/api-foundation.md)
