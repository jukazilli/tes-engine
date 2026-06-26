# ADR-046: Claims de pesquisa com vigencia

Status: ACCEPTED

Data: 2026-06-26

## Contexto

Fontes fiscais e vendor mudam por data, release, UF e ambiente.

## Decisao

Claims de pesquisa devem permitir escopo e vigencia explicitos, incluindo `STATE`, `RELEASE` e
`TENANT_ENVIRONMENT`.

## Consequencias

Claims por UF exigem pais e UF. Claims por release exigem nota de limitacao. Vigencia de pesquisa
nao substitui vigencia legal ou operacional.
