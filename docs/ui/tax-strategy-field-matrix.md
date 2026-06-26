# Matriz de campos da estrategia tributaria

Status: ACCEPTED

## Campos

- Modo: `mode`, controle `po-select` ou radio group, fonte `reference-data/tax-strategy-modes`,
  persiste codigo.
- Tributo: `taxDomainCode`, catalogo somente leitura, fonte `reference-data/tax-domains`, persiste
  codigo.
- Responsavel: `ownerCode`, controle `po-select`, fonte `reference-data/tax-owners`, persiste
  codigo.
- Origem: `sourceType`, controle `po-select`, fonte `reference-data/tax-strategy-source-types`,
  persiste codigo.
- Status: `status`, badge e acoes, fonte API, persiste codigo.
- Vigencia inicial: `validFrom`, date picker, persiste data ISO.
- Vigencia final: `validUntil`, date picker, persiste data ISO.
- Justificativa: `notApplicableReason`, textarea condicional, persiste texto.

Enums nao usam input livre.
