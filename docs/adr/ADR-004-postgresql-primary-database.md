# ADR-004: PostgreSQL como banco local primario

## Status

Aceita

## Contexto

O TES Engine precisara de persistencia relacional para tenants, usuarios, documentos, execucoes e auditoria. Neste corte nao ha ORM nem tabelas.

## Decisao

Usar PostgreSQL em container local com imagem `postgres:17.10-alpine`, volume nomeado e health check `pg_isready`.

## Alternativas

- Instalar PostgreSQL no Windows: descartado para manter ambiente reproduzivel e isolado.
- SQLite local: descartado por divergir das necessidades futuras de producao.

## Consequencias

O ambiente local fica proximo do banco esperado para desenvolvimento. Migrations e ORM serao adicionados em corte futuro.
