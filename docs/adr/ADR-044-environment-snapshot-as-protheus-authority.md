# ADR-044: Snapshot de ambiente como autoridade Protheus

Status: ACCEPTED

Data: 2026-06-26

## Contexto

Catalogos publicos de tabelas Protheus podem divergir do dicionario real de um ambiente.

## Decisao

Para tipo, tamanho, dominio, validacao e customizacao de campo, o snapshot confirmado do ambiente
Protheus do tenant prevalece sobre catalogos genericos.

## Consequencias

Prompt 11.5A define a autoridade, mas nao implementa ingestao SX3. Prompts futuros devem coletar e
confirmar snapshots antes de gerar contratos definitivos.
