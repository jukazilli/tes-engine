# ADR-036: Contratos de controle de campos PO UI

Status: ACCEPTED

Data: 2026-06-25

## Decisao

Campos controlados possuem matriz documentada com tipo de controle. `po-select` e usado para enums
pequenos; `po-combo` para catalogos pesquisaveis; `po-input` nao e aceito para enum.

## Consequencias

`pnpm ui:field-contracts:validate` bloqueia regressao de campo controlado para input livre.
