# Prompt 11: Environment tax strategy

Data: 2026-06-25

## 1. Status

Concluido.

## 2. Commit base

```text
53872f8 feat(master-data): add companies branches and protheus environments
```

## 3. Migration

Criada e aplicada localmente:

```text
infrastructure/database/migrations/0005_environment_tax_strategies.sql
```

Ela cria `app.tax_domains`, `app.environment_tax_strategies` e `app.environment_tax_strategy_items`.

## 4. Biblioteca

Criada:

```text
@tes-engine/backend/tax-strategy
```

## 5. Modos

Modos controlados:

- `LEGACY`
- `HYBRID`
- `FULL_CONFIGTRIB`

## 6. Responsaveis

Responsabilidade por tributo:

- `LEGACY_TES`
- `CONFIGTRIB`
- `NOT_APPLICABLE`

`NOT_APPLICABLE` exige justificativa e nao representa isencao fiscal.

## 7. Dominios

Catalogo inicial:

- `ICMS`
- `ICMS_ST`
- `IPI`
- `PIS`
- `COFINS`
- `ISS`
- `DIFAL`
- `FCP`

IBS e CBS nao foram ativados.

## 8. Estrategias e itens

Estrategias possuem ambiente, filial, modo, status, vigencia, origem, confirmacao e versionamento.
Itens possuem um tributo por estrategia e owner controlado.

## 9. Vigencia e sobreposicao

A resolucao usa `valid_from` e `valid_until`. O banco bloqueia sobreposicao de estrategias
`CONFIRMED` para o mesmo ambiente.

## 10. Consistencia dos modos

Validador puro cobre:

- `LEGACY` sem `CONFIGTRIB`;
- `FULL_CONFIGTRIB` sem `LEGACY_TES`;
- `HYBRID` com mistura real;
- completude antes de confirmacao;
- duplicidade de dominio;
- justificativa para `NOT_APPLICABLE`.

## 11. Integracao com perfil fiscal

Confirmacao exige perfil fiscal `CONFIRMED` vigente na data inicial da estrategia.
`companies.tax_regime` nao e fallback.

## 12. Snapshot e readiness

`TaxContextSnapshot` separa `strategyReady` e `executionReady`. Neste corte, `executionReady`
permanece sempre `false`.

## 13. Blockers

Blockers implementados:

- `MISSING_CONFIRMED_FISCAL_PROFILE`
- `MISSING_CONFIRMED_TAX_STRATEGY`
- `TAX_STRATEGY_INCOMPLETE`
- `TAX_STRATEGY_MODE_MISMATCH`
- `TAX_STRATEGY_OVERLAP`
- `MISSING_SF4_SNAPSHOT`
- `MISSING_CONFIGTRIB_COVERAGE`

## 14. Legacy, Hybrid e Full ConfigTrib

`LEGACY` bloqueia execucao por `MISSING_SF4_SNAPSHOT`. `FULL_CONFIGTRIB` bloqueia por
`MISSING_CONFIGTRIB_COVERAGE`. `HYBRID` apresenta ambos.

## 15. Permissoes

Adicionadas:

- `tax-strategy:read`
- `tax-strategy:create`
- `tax-strategy:update`
- `tax-strategy:submit-review`
- `tax-strategy:confirm`
- `tax-strategy:deactivate`
- `tax-context:resolve`

## 16. RLS

RLS e `FORCE ROW LEVEL SECURITY` habilitados em `environment_tax_strategies` e
`environment_tax_strategy_items`.

## 17. Optimistic locking

PATCH exige `version`. Estrategia confirmada e imutavel.

## 18. Catalogos e APIs

Endpoints adicionados:

- `GET /api/reference-data/tax-strategy-modes`
- `GET /api/reference-data/tax-owners`
- `GET /api/reference-data/tax-domains`
- `GET /api/reference-data/tax-strategy-source-types`
- rotas de estrategia sob `/api/protheus-environments/:environmentId/tax-strategies`
- contexto em `/api/protheus-environments/:environmentId/tax-context/at-date`

## 19. Contratos frontend e PO UI

Contratos adicionados em `libs/shared/contracts`. `docs/ui/master-data-field-matrix.md` e
`docs/ui/tax-strategy-field-matrix.md` registram campos controlados.

## 20. Testes

Scripts adicionados:

- `pnpm test:tax-strategies`
- `pnpm test:tax-context`
- `pnpm test:tax-strategy-rls`
- `pnpm test:tax-strategy-readiness`

## 21. Validacao manual

Validacao manual HTTP completa nao foi executada neste corte. A cobertura automatizada validou
migration, RLS, contracts, typecheck, lint, build, OpenAPI, quality e CI.

## 22. OpenAPI

`pnpm openapi:validate` passou.

## 23. Documentacao

Criados documentos de dominio, arquitetura, UI, desenvolvimento e seguranca.

## 24. Quality e CI

Preflight da baseline passou antes da implementacao. Apos a implementacao, passaram `pnpm quality` e
`pnpm run ci`.

## 25. Pendencias e riscos

- Testes HTTP completos ainda nao cobrem todos os cenarios listados no prompt.
- `executionReady` permanece falso ate existirem SF4 snapshot e cobertura ConfigTrib.
- Nao foi implementado motor fiscal, XML, SX3, SF4, FISA170, MILE ou exportacao.

## 26. Git status

O status final do commit do Prompt 11 fica limpo para os arquivos do corte. Existe um arquivo
externo ao corte, `docs/execution/011.5a-research-source-governance.md`, que nao foi incluido no
commit do Prompt 11.

## 27. Commit

```text
feat(tax-strategy): add effective-dated tax ownership
```

## 28. Recomendacao para o Prompt 12

Avancar somente para dados de suporte ao readiness, como snapshot SF4 ou cobertura ConfigTrib, sem
antecipar importacao de XML ou motor de TES.
