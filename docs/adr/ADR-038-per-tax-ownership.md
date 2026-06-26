# ADR-038 - Responsabilidade por tributo

## Status

ACCEPTED

## Data

2026-06-25

## Decisores

- Engenharia TES Engine

## Contexto

Uma estrategia por ambiente precisa classificar cada tributo ativo sem transformar label em codigo.

## Decisao

Usar `LEGACY_TES`, `CONFIGTRIB` e `NOT_APPLICABLE` por tributo. `NOT_APPLICABLE` exige
justificativa.

## Consequencias positivas

- Evita dupla tributacao por responsabilidade ambigua.
- Mantem catalogo global de tributos controlado por migration.

## Consequencias negativas

- Tributos novos exigem nova migration.

## Riscos

- Mapeamentos Protheus futuros ainda precisam ser validados.

## Relacoes

- Relacionado a: ADR-033, ADR-037.
