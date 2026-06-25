# ADR-035: Separacao entre regime, CRT e MV_CODREG

Status: ACCEPTED

Data: 2026-06-25

## Decisao

Regime tributario, CRT da NF-e e parametro Protheus `MV_CODREG` sao conceitos separados. O valor do
parametro Protheus pode ser registrado e mapeado, mas nao e tratado como codigo canonico do TES.

## Consequencias

O motor fiscal futuro deve escolher a fonte fiscal confirmada e vigente, nao inferir tudo de
`companies.tax_regime`.
