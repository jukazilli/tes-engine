# Typechecking

Status: ACCEPTED

## Objetivo

O typecheck valida tipos TypeScript e, no caso do Angular, templates antes que novas camadas da API
ou do produto sejam implementadas. Ele e um gate independente de lint, testes e build.

## Typecheck, lint, teste e build

| Comando   | Responsabilidade principal                                      |
| --------- | --------------------------------------------------------------- |
| Typecheck | Verificar tipos, imports e contratos de compilacao sem emissao. |
| Lint      | Aplicar regras de codigo, arquitetura e module boundaries.      |
| Teste     | Executar comportamento automatizado com Jest.                   |
| Build     | Gerar artefatos finais e validar empacotamento.                 |

## Como executar tudo

```powershell
pnpm typecheck:coverage
pnpm typecheck
```

`typecheck:coverage` valida que todos os projetos TypeScript possuem target `typecheck`. `typecheck`
executa o target em todos os projetos Nx.

## Como executar um projeto

```powershell
pnpm nx run web:typecheck
pnpm nx run api:typecheck
pnpm nx run worker:typecheck
pnpm nx run engine-core:typecheck
```

Use o nome real listado por:

```powershell
pnpm nx show projects
```

## Projetos afetados

Para mudancas locais, o comando afetado pode ser usado quando for necessario reduzir o escopo:

```powershell
pnpm nx affected -t typecheck
```

O gate completo continua sendo `pnpm typecheck`.

## Angular template checking

O projeto `web` usa:

```text
ngc -p apps/web/tsconfig.app.json --noEmit
```

Essa estrategia verifica TypeScript e templates Angular com `strictTemplates` ativo, incluindo
bindings, inputs, outputs e componentes standalone.

As bibliotecas `frontend-shell` e `frontend-ui` ainda sao bibliotecas TypeScript simples neste corte
e usam `tsc --noEmit`. Se passarem a conter componentes Angular com templates, o target deve migrar
para `ngc`.

## API e worker

API e worker usam:

```text
tsc --noEmit -p apps/api/tsconfig.app.json
tsc --noEmit -p apps/worker/tsconfig.app.json
```

O objetivo e validar codigo NestJS sem gerar artefatos e sem iniciar servidores.

## Bibliotecas

Cada biblioteca usa seu `tsconfig.lib.json`:

```text
tsc --noEmit -p libs/<area>/<nome>/tsconfig.lib.json
```

O target deve ser adicionado no `project.json` da biblioteca. O validador de cobertura falha se uma
nova biblioteca TypeScript ficar sem target.

## Testes

O typecheck principal usa `tsconfig.app.json` ou `tsconfig.lib.json` e nao substitui o Jest.
Arquivos `*.spec.ts` continuam cobertos pelos targets `test` e respectivos `tsconfig.spec.json`.

## Interpretacao de falhas

- Erro em `web:typecheck`: revise types Angular, templates, bindings ou imports standalone.
- Erro em `api:typecheck` ou `worker:typecheck`: revise DTOs, providers, imports e tipos Node.
- Erro em biblioteca: revise API publica, aliases e contratos compartilhados.
- Erro em `typecheck:coverage`: adicione target `typecheck` ao projeto TypeScript novo.

## Cache Nx

Targets `typecheck` sao cacheaveis e nao declaram outputs porque usam `--noEmit`. Entradas de fonte,
`tsconfig`, aliases, dependencias e lockfile participam da invalidacao pelos inputs padrao do Nx.

Para limpar cache:

```powershell
pnpm nx reset
```

## Politica

Nao enfraquecer `strict`, `strictTemplates`, `noImplicitAny` ou regras equivalentes para fazer o
typecheck passar. Corrija o tipo, o contrato ou o template.

O typecheck e obrigatorio antes da fundacao da API para impedir que novos filtros, pipes,
interceptors e contratos sejam adicionados sobre uma baseline sem verificacao estatica completa.

## CI local

O script `ci` existe no `package.json`, mas no pnpm 9.11.0 o comando direto `pnpm ci` e interceptado
por um builtin ainda nao implementado. Execute o script com:

```powershell
pnpm run ci
```

Documentos relacionados:

- [Quality strategy](../architecture/quality-strategy.md)
- [Module boundaries](../architecture/module-boundaries.md)
- [ADR-013](../adr/ADR-013-explicit-typechecking.md)
