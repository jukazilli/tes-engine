# ADR-001: Monorepo Nx

## Status

Aceita

## Contexto

O TES Engine precisa evoluir em cortes pequenos com frontend, API, worker e bibliotecas
compartilhadas. A separacao deve permitir lint, testes, builds e regras de dependencia desde o
inicio.

## Decisao

Usar Nx 23.0.1 em workspace integrado com pnpm, contendo apps em `apps/` e bibliotecas em `libs/`.

## Alternativas consideradas

- Repositorios separados: reduziria acoplamento operacional, mas dificultaria contratos e validações
  coordenadas neste inicio.
- Monorepo sem Nx: simplificaria ferramentas, mas perderia graph, affected commands e module
  boundaries.

## Consequencias

O projeto passa a ter comandos padronizados, cache e grafo de dependencias. As regras de boundaries
precisam ser mantidas conforme novos modulos forem criados.
