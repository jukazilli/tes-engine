# ADR-013: Explicit typechecking

Status: ACCEPTED

Data: 2026-06-25

## Contexto

O preflight do Prompt 06 bloqueou corretamente porque `pnpm typecheck` era exigido, mas nao existia
na baseline. O build validava empacotamento e o lint validava regras de codigo, mas nao havia um
gate explicito e independente para verificacao estatica de tipos em todos os projetos Nx.

## Decisao

Adicionar targets `typecheck` explicitos para todos os projetos TypeScript atuais e expor os scripts
raiz:

```text
pnpm typecheck:coverage
pnpm typecheck
```

`typecheck:coverage` valida estruturalmente que todo projeto TypeScript possui cobertura.
`typecheck` executa os targets Nx de todos os projetos.

## Estrategia Angular

O projeto `web` usa `ngc --noEmit` com `apps/web/tsconfig.app.json` para validar TypeScript e
templates Angular com `strictTemplates` ativo.

## Estrategia NestJS

API e worker usam `tsc --noEmit` com seus respectivos `tsconfig.app.json`. O comando valida codigo
NestJS sem iniciar processos e sem gerar artefatos.

## Estrategia das bibliotecas

Bibliotecas usam `tsc --noEmit` com `tsconfig.lib.json`. Se uma biblioteca frontend passar a conter
componentes Angular com templates, seu target deve ser ajustado para usar `ngc`.

## Alternativas consideradas

- Usar apenas `build`: rejeitado porque build mistura empacotamento, emissao e verificacao de tipos.
- Usar apenas `tsc` no `web`: rejeitado porque nao cobre templates Angular.
- Rodar Jest como substituto: rejeitado porque testes validam comportamento, nao cobertura estatica
  completa de tipos.

## Consequencias

- `quality:fast`, `quality`, `ci` e GitHub Actions passam a bloquear regressao de tipos.
- O gate fica mais lento que lint isolado, mas captura problemas antes dos builds e dos prompts de
  API.
- Novos projetos TypeScript precisam declarar target `typecheck`.

## Documentos relacionados

- [Typechecking](../development/typechecking.md)
- [Quality strategy](../architecture/quality-strategy.md)
