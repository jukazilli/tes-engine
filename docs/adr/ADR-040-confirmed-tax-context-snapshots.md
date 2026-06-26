# ADR-040 - Snapshots confirmados de contexto tributario

## Status

ACCEPTED

## Data

2026-06-25

## Decisores

- Engenharia TES Engine

## Contexto

O motor fiscal futuro precisa receber um contexto estavel sem depender de entidades NestJS, Drizzle,
PO UI ou registros draft.

## Decisao

Resolver snapshot somente com perfil fiscal e estrategia confirmados e vigentes. Quando faltar
configuracao, retornar readiness com blockers.

## Consequencias positivas

- Cria fronteira limpa para motores futuros.
- Evita usar `companies.tax_regime` como fallback.

## Consequencias negativas

- Execucao permanece bloqueada ate dados futuros existirem.

## Riscos

- Campos opcionais do snapshot podem ser refinados quando o motor nascer.

## Relacoes

- Relacionado a: ADR-010, ADR-034, ADR-039.
