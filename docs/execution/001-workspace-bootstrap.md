# 001 - Workspace bootstrap

Data: 2026-06-24

## 1. Resumo

Foi criado o monorepo Nx inicial do TES Engine em `C:\projetos\tes-engine`, com:

- SPA Angular em `apps/web` usando PO UI real.
- API NestJS em `apps/api` com `GET /api/health`.
- Worker NestJS em `apps/worker` sem porta HTTP publica.
- Bibliotecas iniciais em `libs/frontend`, `libs/backend`, `libs/shared` e `libs/engines`.
- Regras iniciais de module boundaries via ESLint/Nx.
- README, stack baseline, mapa modular e ADRs iniciais.

Nao foram criados banco, Redis, MinIO, Docker Compose, autenticacao, parser XML, regras fiscais,
wizard ou exportacoes.

## 2. Estado anterior

- `C:\projetos` existia com outros projetos.
- `C:\projetos\tes-engine` nao existia.
- Node.js, Corepack, pnpm e Git estavam disponiveis.

## 3. Comandos executados

Principais comandos:

```powershell
Get-ChildItem -Force C:\projetos
Test-Path C:\projetos\tes-engine
node --version
corepack --version
pnpm --version
git --version
npm view @po-ui/ng-components version peerDependencies dependencies --json
npm view @nx/angular version peerDependencies --json
npm view @nestjs/core version peerDependencies --json
pnpm dlx create-nx-workspace@23.0.1 tes-engine --preset=apps --workspaceType=integrated --pm=pnpm --nxCloud=skip --interactive=false
pnpm add -D @nx/angular@23.0.1 @nx/nest@23.0.1 @nx/eslint@23.0.1 @nx/jest@23.0.1 @nx/vite@23.0.1 @nx/js@23.0.1 @nx/node@23.0.1
pnpm nx g @nx/angular:application --name=web --directory=apps/web --standalone=true --routing=true --style=scss --unitTestRunner=jest --e2eTestRunner=none --bundler=esbuild --ssr=false --strict=true --interactive=false
pnpm nx g @nx/nest:application --name=api --directory=apps/api --unitTestRunner=jest --linter=eslint --strict=true --interactive=false
pnpm nx g @nx/nest:application --name=worker --directory=apps/worker --unitTestRunner=jest --linter=eslint --strict=true --interactive=false
pnpm add @po-ui/ng-components@21.21.0 @po-ui/style@21.21.0 @angular/cdk@21.2.4 zone.js@0.15.1 @angular/animations@21.2.17
pnpm add -D supertest@7.1.4 @types/supertest@6.0.3
pnpm lint
pnpm test
pnpm build:web
pnpm build:api
pnpm build:worker
pnpm build
```

## 4. Versoes instaladas

| Item        | Versao           |
| ----------- | ---------------- |
| Node.js     | 22.12.0          |
| Corepack    | 0.29.4           |
| pnpm        | 9.11.0           |
| Git         | 2.41.0.windows.1 |
| Nx          | 23.0.1           |
| Angular     | 21.2.17          |
| Angular CDK | 21.2.4           |
| PO UI       | 21.21.0          |
| NestJS      | 11.1.27          |
| TypeScript  | 5.9.3            |
| RxJS        | 7.8.2            |
| Zone.js     | 0.15.1           |
| Jest        | 30.3.0           |
| Supertest   | 7.1.4            |

## 5. Estrutura final criada

```text
apps/
  web/
  api/
  worker/
libs/
  frontend/
    shell/
    ui/
  backend/
    common/
  shared/
    contracts/
    domain-types/
    testing/
  engines/
    core/
docs/
  architecture/
  adr/
  execution/
infrastructure/
tools/
```

## 6. Arquivos principais

- `apps/web/src/app/app.ts`
- `apps/web/src/app/app.html`
- `apps/web/src/styles.scss`
- `apps/api/src/main.ts`
- `apps/api/src/app/app.controller.ts`
- `apps/api/src/app/health.e2e-spec.ts`
- `apps/worker/src/main.ts`
- `eslint.config.mjs`
- `package.json`
- `.env.example`
- `README.md`
- `docs/architecture/stack-baseline.md`
- `docs/architecture/module-map.md`
- `docs/adr/ADR-001-monorepo-nx.md`
- `docs/adr/ADR-002-angular-po-ui.md`
- `docs/adr/ADR-003-nestjs-api-worker.md`
- `docs/execution/tes-engine-prompt-001-web.png`

## 7. Resultado de lint

`pnpm lint`: passou.

Resultado: targets `eslint:lint` e `lint` executados para os 10 projetos. Todos passaram.

## 8. Resultado de testes

`pnpm test`: passou.

Resultado: target `test` executado para os 10 projetos. Todos passaram.

Detalhes relevantes:

- `api:test`: 2 suites, 2 testes.
- `web:test`: 1 suite, 1 teste.
- `worker:test`: 1 suite, 1 teste.
- bibliotecas iniciais: 1 suite por lib gerada.

## 9. Resultado de builds

- `pnpm build:web`: passou.
- `pnpm build:api`: passou.
- `pnpm build:worker`: passou.
- `pnpm build`: passou para os 10 projetos.

Observacao: o bundle inicial de producao do web ficou em aproximadamente 2.86 MB bruto e 558.52 kB
estimado transferido. O budget inicial foi ajustado para `maximumWarning: 3mb` e
`maximumError: 4mb`, pois o requisito deste corte exige PO UI real com tema instalado.

## 10. Health check

API iniciada em porta alternativa para validacao:

```text
http://localhost:3333/api/health
```

Resposta validada:

```json
{ "status": "ok", "service": "tes-engine-api" }
```

## 11. Validacao visual PO UI

Frontend iniciado em porta alternativa:

```text
http://localhost:4300
```

Playwright abriu a pagina com title `TES Engine` e snapshot contendo:

- toolbar com `TES Engine`;
- menu PO UI com item `Inicio`;
- pagina PO UI com titulo `TES Engine`;
- texto `Ambiente inicial configurado`;
- versoes `Angular 21.2.17` e `PO UI 21.21.0`.

Screenshot salvo em `docs/execution/tes-engine-prompt-001-web.png`.

## 12. Bootstrap do worker

Validacao executada pelo build:

```powershell
node dist/apps/worker/main.js
```

Log observado:

```json
{ "service": "tes-engine-worker", "status": "initialized", "environment": "development" }
```

`pnpm nx serve worker` foi testado, mas o target `serve` do Nx permaneceu em modo continuo/watch e
foi encerrado por timeout. A validacao objetiva do executavel foi feita com o artefato buildado.

## 13. Decisoes e desvios

- Angular 22 foi descartado porque PO UI 21.21.0 declara compatibilidade com Angular `^21` e
  `@nx/angular` 23.0.1 limita builders Angular a `<22`.
- Os apps `api-e2e` e `worker-e2e` criados automaticamente pelo gerador Nest foram removidos por
  ficarem fora da estrutura minima pedida.
- O Jest do web foi configurado para transformar ESM de Angular, PO UI, ECharts e ZRender.
- `PoModule` foi trocado por modulos PO UI especificos (`PoMenuModule`, `PoPageModule`,
  `PoToolbarModule`).
- O screenshot do Playwright foi salvo inicialmente em `C:\projetos` e movido para `docs/execution/`
  para manter o estado final restrito ao projeto.

## 14. Pendencias conhecidas

- Nenhuma pendencia bloqueante do Prompt 01.
- O executor `@nx/jest:jest` e o executor `@nx/eslint:lint` aparecem com aviso de deprecacao para Nx
  v24; nao foram migrados neste corte para evitar mudanca fora do escopo.
- O Prompt 02 deve configurar infraestrutura local: PostgreSQL, Redis, MinIO e Mailpit.

## 15. Riscos identificados

- O bundle inicial do PO UI e tema e maior que o budget padrao gerado pelo Nx. O budget foi ajustado
  para a baseline; uma otimizacao fina deve ser tratada quando houver telas reais.
- Angular 21 e PO UI 21 estao alinhados agora, mas upgrades futuros devem ser coordenados com peer
  dependencies do PO UI.

## 16. `git status --short`

Estado antes do commit do Prompt 01:

```text
 M .gitignore
 M .vscode/extensions.json
 M README.md
 M nx.json
 M package.json
 M pnpm-lock.yaml
?? .env.example
?? .prettierignore
?? .prettierrc
?? .vscode/launch.json
?? apps/
?? docs/
?? eslint.config.mjs
?? infrastructure/
?? jest.config.ts
?? jest.preset.js
?? libs/
?? tools/
?? tsconfig.base.json
```

## 17. Escopo de arquivos

Estado final pretendido: somente arquivos dentro de `C:\projetos\tes-engine`. Nao foram apagados ou
alterados outros projetos em `C:\projetos`.

## 18. Proximo passo recomendado

Liberar o Prompt 02 somente apos revisar este relatorio e executar, se desejado, os comandos:

```powershell
pnpm lint
pnpm test
pnpm build
```
