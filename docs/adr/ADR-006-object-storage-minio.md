# ADR-006: MinIO para armazenamento local

## Status

Aceita

## Contexto

O TES Engine precisara armazenar XMLs, ZIPs e exportacoes privadas. Neste corte nao ha upload na aplicacao.

## Decisao

Usar MinIO local com imagem `minio/minio:RELEASE.2025-09-07T16-13-09Z` e `minio/mc:RELEASE.2025-08-13T08-35-41Z` para criar o bucket privado `tes-engine-dev`.

## Alternativas

- Armazenamento local em disco: descartado por nao exercitar contrato S3.
- Servico S3 externo em desenvolvimento local: descartado por custo e dependencia externa.

## Consequencias

O desenvolvimento local tera API S3 compativel. Politicas de producao, criptografia e retencao serao decididas posteriormente.
