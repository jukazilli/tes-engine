# ADR-041 - Bloqueio futuro de exportacao ConfigTrib

## Status

ACCEPTED

## Data

2026-06-25

## Decisores

- Engenharia TES Engine

## Contexto

Quando um tributo for tratado por ConfigTrib, a TES futura devera neutralizar gatilhos legados para
evitar dupla tributacao.

## Decisao

Manter `executionReady=false` neste corte e registrar blocker `MISSING_CONFIGTRIB_COVERAGE` para
modos que dependem de ConfigTrib.

## Consequencias positivas

- Impede falsa prontidao antes de cobertura ConfigTrib.
- Prepara bloqueio de exportacao quando houver TES neutra sem cobertura equivalente.

## Consequencias negativas

- Nenhum ambiente fica pronto para execucao fiscal neste prompt.

## Riscos

- A regra final depende de validacao futura do Configurador de Tributos.

## Relacoes

- Relacionado a: ADR-037, ADR-038, ADR-040.
