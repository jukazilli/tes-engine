# ADR-042: Hierarquia de autoridade de fontes

Status: ACCEPTED

Data: 2026-06-26

## Contexto

O TES Engine passara a pesquisar Protheus, NF-e e regras fiscais antes de implementar automacoes.
Fontes oficiais, snapshots de ambiente e catalogos auxiliares nao tem o mesmo peso.

## Decisao

Adotar hierarquia explicita: `PRIMARY_NORMATIVE`, `PRIMARY_VENDOR`, `ENVIRONMENT_SNAPSHOT`,
`INTERNAL_DECISION`, `SECONDARY_TECHNICAL` e `COMMUNITY_REFERENCE`.

## Consequencias

Claims e decisoes devem declarar autoridade. Fonte secundaria nao pode sustentar regra normativa sem
limitacao.
