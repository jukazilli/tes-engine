# ADR-031: Paginacao por cursor

Status: ACCEPTED

Data: 2026-06-25

## Decisao

Listagens de master data usam keyset pagination com cursor opaco, limite padrao 25 e maximo 100.

## Consequencias

Listas crescentes evitam `offset` e mantem ordenacao deterministica por `created_at` e `id`.
