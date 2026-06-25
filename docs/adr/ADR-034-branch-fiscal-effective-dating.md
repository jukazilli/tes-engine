# ADR-034: Vigencia do perfil fiscal da filial

Status: ACCEPTED

Data: 2026-06-25

## Decisao

Perfil fiscal da filial usa `valid_from` e `valid_until`; o perfil atual e derivado por data. Perfis
confirmados nao podem sobrepor periodos.

## Consequencias

Nao existe `is_current`. Historico fiscal e preservado.
