# ADR-005: Redis local

## Status

Aceita

## Contexto

O projeto usara Redis futuramente para filas e possivelmente cache. O Prompt 02 exige somente infraestrutura, sem BullMQ.

## Decisao

Usar `redis:7.4-alpine` em container local, com AOF habilitado e volume nomeado.

## Alternativas

- Redis nativo no Windows: descartado por reduzir reprodutibilidade.
- Valkey: adiado para decisao futura, pois o prompt especifica Redis.

## Consequencias

Redis fica disponivel localmente sem acoplar API ou worker. Integracao com BullMQ deve ocorrer em corte posterior.
