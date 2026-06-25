# ADR-012 - Documentation governance and sources of truth

## Status

Accepted.

## Data

2026-06-25

## Contexto

O TES Engine acumulou ADRs, relatorios de execucao e documentos arquiteturais nos primeiros cortes.
Era necessario transformar `docs` em fonte canonica navegavel e verificavel antes de adicionar
dominio, persistencia ou funcionalidades.

## Decisao

Criar governanca documental com hierarquia explicita de fonte de verdade, indice principal,
catalogos, templates, roadmap e validacao automatica de Markdown e links internos.

## Alternativas consideradas

- Manter apenas relatorios de execucao: rejeitado porque relatorios sao historicos.
- Centralizar tudo no README raiz: rejeitado porque duplicaria arquitetura e dominio.
- Usar ferramenta externa de documentacao: rejeitado neste momento para evitar dependencia
  operacional adicional.

## Consequencias

Documentos passam a ser validados por `pnpm docs:validate` e pelo CI. Novas decisoes devem seguir
ADRs, RFCs ou documentos canonicos conforme a hierarquia definida.
