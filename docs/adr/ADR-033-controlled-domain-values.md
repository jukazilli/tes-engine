# ADR-033: Valores de dominio controlado

Status: ACCEPTED

Data: 2026-06-25

## Decisao

Dominios fiscais e cadastrais usam constantes tipadas, DTOs, checks de banco e catalogos de
referencia. Labels nao sao persistidos como codigos.

## Consequencias

A UI consome `ReferenceOption` e envia codigos estaveis.
