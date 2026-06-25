# ADR-032: Desativacao logica de master data

Status: ACCEPTED

Data: 2026-06-25

## Decisao

Empresas, filiais, ambientes e perfis fiscais sao desativados logicamente. Desativacao nao remove
dependencias automaticamente.

## Consequencias

Empresa com filial ativa e filial com ambiente ativo nao podem ser desativadas.
