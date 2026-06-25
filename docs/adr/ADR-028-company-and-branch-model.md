# ADR-028: Modelo de empresas e filiais

Status: ACCEPTED

Data: 2026-06-25

## Decisao

Modelar empresa como grupo fiscal por raiz de CNPJ e filial como estabelecimento fiscal por CNPJ
completo. O banco valida que filial e empresa pertencem a mesma organizacao e que a raiz do CNPJ da
filial bate com a empresa.

## Consequencias

Empresas nao representam instalacao Protheus. Filiais sao o ponto fiscal para endereco, perfil
fiscal e ambientes.
