# ADR-037 - Modos de estrategia tributaria do ambiente

## Status

ACCEPTED

## Data

2026-06-25

## Decisores

- Engenharia TES Engine

## Contexto

O motor futuro precisa saber se os tributos de um ambiente Protheus serao tratados por TES legada,
Configurador de Tributos ou combinacao controlada.

## Decisao

Adotar os modos `LEGACY`, `HYBRID` e `FULL_CONFIGTRIB`.

## Consequencias positivas

- Evita criar TES por item.
- Explicita o mecanismo tributario antes da analise de XML.

## Consequencias negativas

- Exige configuracao previa por ambiente.

## Riscos

- Configuracao incorreta pode bloquear confirmacao.

## Relacoes

- Relacionado a: ADR-038, ADR-039, ADR-040, ADR-041.
