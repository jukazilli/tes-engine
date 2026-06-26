# Estrategia tributaria do ambiente

Status: ACCEPTED

## Objetivo

A estrategia tributaria define onde cada tributo aplicavel de um ambiente Protheus sera tratado: TES
legada, Configurador de Tributos ou nao aplicavel com decisao explicita.

Ela nao substitui o perfil fiscal da filial. Perfil fiscal descreve quem a filial e fiscalmente.
Estrategia tributaria descreve qual mecanismo trata cada tributo no ambiente.

## Modos

- `LEGACY`: todos os tributos aplicaveis usam `LEGACY_TES`.
- `FULL_CONFIGTRIB`: todos os tributos aplicaveis usam `CONFIGTRIB`.
- `HYBRID`: exige pelo menos um tributo `LEGACY_TES` e um tributo `CONFIGTRIB`.

## Vigencia

A estrategia e resolvida por data:

```text
valid_from <= reference_date
AND (valid_until IS NULL OR valid_until >= reference_date)
```

O banco bloqueia sobreposicao de estrategias `CONFIRMED` para o mesmo ambiente.

## Confirmacao

Confirmar exige estrategia completa, modo consistente, ausencia de sobreposicao e perfil fiscal
`CONFIRMED` vigente na data inicial. `companies.tax_regime` nao e fallback.

## Fora do corte

Este corte nao implementa XML, SX3, SF4, FISA170, MILE, motor fiscal ou exportacao.
