# Prompt 10A: Branch fiscal profiles and controlled fields

Data: 2026-06-25

## 1. Status

Concluido junto ao Prompt 10.

## 2. Estado encontrado do Prompt 10

O Prompt 10 ainda nao havia sido commitado nem aplicado no repositorio quando o Prompt 10A foi
integrado. Por isso, o modelo de perfil fiscal foi incluido diretamente na migration `0004`, sem
criar migration corretiva artificial.

## 3. Fontes oficiais consultadas

Foram consultadas fontes oficiais da NF-e para CRT e `indIEDest`, e fontes oficiais TOTVS/TDN para
`MV_CODREG`. Onde o mapeamento externo nao ficou seguro, o documento
`docs/domain/fiscal-regime-reference.md` registra pendencia em vez de presumir equivalencia.

## 4. Regime, CRT e MV_CODREG

Regime tributario, CRT da NF-e e `MV_CODREG` foram separados:

- `taxRegimeCode` representa dominio canonico do TES Engine;
- `nfeCrtCode` representa codigo CRT da NF-e;
- `protheus_parameter_*` e `protheus_parameter_mappings` preservam valores Protheus.

`companies.tax_regime` foi mantido como classificacao cadastral legada, nao como fonte fiscal
definitiva.

## 5. Perfil fiscal e vigencia

Criada tabela:

```text
app.branch_fiscal_profiles
```

Ela possui `valid_from`, `valid_until`, status controlado, origem, usuario de confirmacao e
versionamento. O banco bloqueia sobreposicao de perfis `CONFIRMED` para a mesma filial.

## 6. Origem e confirmacao

Origens controladas:

- `MANUAL`
- `PROTHEUS_PARAMETER`
- `IMPORTED_FILE`
- `SYSTEM_INFERENCE`
- `FISCAL_REVIEW`

Inferencias do sistema nao iniciam confirmadas. Confirmacao registra usuario e data.

## 7. Mappings Protheus

Criada tabela:

```text
app.protheus_parameter_mappings
```

O parametro inicial permitido e `MV_CODREG`. Valores originais sao texto, preservando zeros e sem
assumir equivalencia automatica com codigo canonico.

## 8. Catalogos e API

Endpoints adicionados:

- `GET /api/reference-data/tax-regimes`
- `GET /api/reference-data/nfe-crt`
- `GET /api/reference-data/icms-taxpayer-indicators`
- `GET /api/reference-data/establishment-types`
- `GET /api/reference-data/environment-types`
- `GET /api/reference-data/states`
- `GET /api/reference-data/countries`

Perfis fiscais usam rotas sob `/api/branches/:branchId/fiscal-profiles`.

## 9. Permissoes

Adicionadas permissions explicitas:

- `branch-fiscal-profile:read`
- `branch-fiscal-profile:create`
- `branch-fiscal-profile:update`
- `branch-fiscal-profile:confirm`
- `branch-fiscal-profile:deactivate`
- `protheus-parameter-mapping:read`
- `protheus-parameter-mapping:create`
- `protheus-parameter-mapping:validate`

Matriz: `ADMIN` com todas; `CONSULTANT` cria/atualiza perfil e cria mapping; `TAX_ANALYST` confirma
e valida; `APPROVER` confirma; `VIEWER` apenas le.

## 10. RLS

RLS e `FORCE ROW LEVEL SECURITY` habilitados em `branch_fiscal_profiles` e
`protheus_parameter_mappings`. FKs compostas impedem filial ou ambiente de outro tenant.

## 11. Contratos frontend e PO UI

Contratos adicionados em `libs/shared/contracts`:

- `ReferenceOption`
- `ControlledFieldContract`
- `FiscalProfileFormOptions`
- adapter `toPoSelectOptions`

Documentos:

- `docs/ui/master-data-field-matrix.md`
- `docs/ui/controlled-fields.md`

O comando `pnpm ui:field-contracts:validate` bloqueia enum registrado como `INPUT`.

## 12. Testes

Scripts adicionados e aprovados:

- `pnpm test:branch-fiscal-profiles`
- `pnpm test:reference-data`
- `pnpm ui:field-contracts:validate`

Tambem passaram typecheck, lint, build, OpenAPI, `pnpm quality` e `pnpm run ci`.

## 13. OpenAPI

`pnpm openapi:validate` passou com os novos controllers e schemas.

## 14. Pendencias e riscos

- Mapeamento oficial completo de `MV_CODREG` permanece documentado como pendente quando nao
  confirmado por fonte oficial suficiente.
- Tela Angular completa nao foi criada por escopo.
- O aviso de Jest worker permanece risco monitorado.

## 15. Git

Commit criado:

```text
feat(master-data): add companies branches and protheus environments
```

## 16. Recomendacao para o Prompt 11

Usar perfil fiscal confirmado e vigente por data como fonte de entrada para estrategia tributaria do
ambiente. Nao antecipar SX3, SF4, MILE, projetos ou UI completa.
