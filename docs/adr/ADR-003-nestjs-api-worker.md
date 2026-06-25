# ADR-003: NestJS para API e worker

## Status

Aceita

## Contexto

O produto tera uma API HTTP e processamento assíncrono futuro. Neste corte ainda nao ha banco, fila
ou integrações externas.

## Decisao

Usar NestJS 11 para `apps/api` e `apps/worker`. A API expoe `/api/health`. O worker usa
`createApplicationContext`, inicializa separadamente e nao abre porta HTTP.

## Alternativas consideradas

- Um unico app Nest com jobs internos: descartado porque mistura ciclo de vida HTTP com
  processamento.
- Worker Node puro: descartado para manter padrao NestJS e DI compartilhavel.

## Consequencias

A API e o worker podem evoluir independentemente. BullMQ, Redis e tarefas reais serao adicionados
somente em cortes futuros.
