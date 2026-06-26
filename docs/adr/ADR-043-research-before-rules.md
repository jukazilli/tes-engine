# ADR-043: Pesquisa antes de regras

Status: ACCEPTED

Data: 2026-06-26

## Contexto

Regras fiscais e contratos Protheus podem causar regressao operacional quando implementados por
suposicao.

## Decisao

Toda regra futura com impacto fiscal ou Protheus deve referenciar pergunta, fonte, evidencia, claim
e decisao aceitos.

## Consequencias

O reposititorio ganha validadores de pesquisa. Implementacoes sem evidencia devem ser rejeitadas em
review.
