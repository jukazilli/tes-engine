# ADR-047: Limites de evidencia XML sintetica

Status: ACCEPTED

Data: 2026-06-26

## Contexto

XML sintetico e util para testes, mas nao representa documento fiscal real nem fonte normativa.

## Decisao

XML sintetico deve ser classificado como `SYNTHETIC_XML` ou `SYNTHETIC_EVIDENCE` e nunca como
`PRIMARY_NORMATIVE`.

## Consequencias

Fixtures sinteticas podem validar parser ou schema, mas nao provam regra fiscal, comportamento de UF
ou semantica tributaria.
