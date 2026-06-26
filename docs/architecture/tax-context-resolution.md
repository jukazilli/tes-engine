# Resolucao do contexto tributario

Status: ACCEPTED

## Entrada

A resolucao recebe `organizationId`, `environmentId` e `referenceDate`.

## Fontes

1. Ambiente Protheus tenant-scoped.
2. Perfil fiscal da filial `CONFIRMED` e vigente.
3. Estrategia tributaria do ambiente `CONFIRMED` e vigente.
4. Itens de responsabilidade por tributo.

## Snapshot

O snapshot nao contem entidades internas, credenciais, parametros nao validados ou calculo fiscal.
Ele separa:

- `strategyReady`: configuracao tributaria pronta.
- `executionReady`: sempre `false` neste corte.

## Blockers

Mesmo com estrategia pronta, a execucao fica bloqueada por dados futuros:

- `MISSING_SF4_SNAPSHOT` para `LEGACY` e `HYBRID`.
- `MISSING_CONFIGTRIB_COVERAGE` para `FULL_CONFIGTRIB` e `HYBRID`.
