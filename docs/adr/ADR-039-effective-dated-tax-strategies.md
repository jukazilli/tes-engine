# ADR-039 - Estrategias tributarias com vigencia

## Status

ACCEPTED

## Data

2026-06-25

## Decisores

- Engenharia TES Engine

## Contexto

Ambientes podem mudar de estrategia ao longo do tempo. Um booleano `is_current` nao preserva
historico nem resolve analise por data.

## Decisao

Usar `valid_from` e `valid_until`, bloqueando sobreposicao de estrategias `CONFIRMED` por ambiente.

## Consequencias positivas

- Permite resolver contexto por data.
- Mantem historico de configuracoes confirmadas.

## Consequencias negativas

- Confirmacao precisa validar periodo e perfil fiscal vigente.

## Riscos

- Alteracao de estrategia confirmada exige nova estrategia.

## Relacoes

- Relacionado a: ADR-034, ADR-037.
