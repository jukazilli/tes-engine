# Responsabilidade por tributo

Status: ACCEPTED

## Codigos

- `LEGACY_TES`: tributo tratado pelos campos tributarios da TES.
- `CONFIGTRIB`: tributo tratado pelo Configurador de Tributos.
- `NOT_APPLICABLE`: tributo explicitamente nao aplicavel ao comportamento analisado.

`NOT_APPLICABLE` exige justificativa e nao significa isencao fiscal.

## Catalogo inicial

O catalogo global `app.tax_domains` inicia com:

- `ICMS`
- `ICMS_ST`
- `IPI`
- `PIS`
- `COFINS`
- `ISS`
- `DIFAL`
- `FCP`

Novos tributos entram por migration. IBS e CBS nao foram ativados neste corte.
