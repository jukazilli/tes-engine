# Campos controlados

Status: ACCEPTED

Campos controlados nao usam `po-input` nem persistem label:

- `taxRegimeCode`;
- `nfeCrtCode`;
- `icmsTaxpayerIndicator`;
- `establishmentType`;
- `environmentType`;
- `stateCode`;
- `countryCode`;
- `status`.

Regras PO UI:

- `po-select` para listas pequenas e estaticas;
- `po-combo` para catalogos pesquisaveis;
- `po-input` apenas para texto livre controlado;
- status muda por acao, nao por dropdown generico.

O comando `pnpm ui:field-contracts:validate` falha se campo controlado estiver registrado como
`INPUT`.
