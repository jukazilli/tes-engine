# Stack baseline

Data da verificacao: 2026-06-24

## Versoes utilizadas

| Componente | Versao  |
| ---------- | ------- |
| Node.js    | 22.12.0 |
| Corepack   | 0.29.4  |
| pnpm       | 9.11.0  |
| Nx         | 23.0.1  |
| Angular    | 21.2.17 |
| PO UI      | 21.21.0 |
| NestJS     | 11.1.27 |
| TypeScript | 5.9.3   |
| RxJS       | 7.8.2   |
| Zone.js    | 0.15.1  |

## Fontes consultadas

- PO UI npm package: `https://www.npmjs.com/package/@po-ui/ng-components`
- PO UI peer dependencies via
  `npm view @po-ui/ng-components version peerDependencies dependencies --json`
- Angular version compatibility: `https://angular.dev/reference/versions`
- Nx Angular version matrix:
  `https://nx.dev/docs/technologies/angular/guides/angular-nx-version-matrix`
- NestJS npm package: `https://www.npmjs.com/package/@nestjs/core`

## Compatibilidade encontrada

O PO UI 21.21.0 declara suporte a Angular `^21`, RxJS `~7.8.1`, Zone.js `~0.15.0` e `@angular/cdk`
`^21`. O `@nx/angular` 23.0.1 declara suporte aos builders Angular `>=19.0.0 <22.0.0`, portanto
Angular 22 foi descartado mesmo estando disponivel no npm.

A baseline escolhida usa Angular 21.2.17, PO UI 21.21.0, Nx 23.0.1 e NestJS 11.1.27. A versao
Angular 21.2.x aceita TypeScript `>=5.9 <6.1`; o lockfile resolveu TypeScript 5.9.3.

## Justificativa

A combinacao Angular 21.2.17 + PO UI 21.21.0 + NestJS 11.1.27 e compativel com os peer dependencies
atuais do PO UI e com os limites do `@nx/angular`. Angular 22 nao foi usado para nao exceder a
compatibilidade oficial do PO UI escolhido.

## Comandos de criacao utilizados

```powershell
pnpm dlx create-nx-workspace@23.0.1 tes-engine --preset=apps --workspaceType=integrated --pm=pnpm --nxCloud=skip --interactive=false
pnpm add -D @nx/angular@23.0.1 @nx/nest@23.0.1 @nx/eslint@23.0.1 @nx/jest@23.0.1 @nx/vite@23.0.1 @nx/js@23.0.1 @nx/node@23.0.1
pnpm nx g @nx/angular:application --name=web --directory=apps/web --standalone=true --routing=true --style=scss --unitTestRunner=jest --e2eTestRunner=none --bundler=esbuild --ssr=false --strict=true --interactive=false
pnpm nx g @nx/nest:application --name=api --directory=apps/api --unitTestRunner=jest --linter=eslint --strict=true --interactive=false
pnpm nx g @nx/nest:application --name=worker --directory=apps/worker --unitTestRunner=jest --linter=eslint --strict=true --interactive=false
pnpm add @po-ui/ng-components@21.21.0 @po-ui/style@21.21.0 @angular/cdk@21.2.4 zone.js@0.15.1 @angular/animations@21.2.17
```
