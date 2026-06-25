# Perfil fiscal da filial

Status: ACCEPTED

O perfil fiscal da filial separa conceitos que nao devem ser misturados:

- regime tributario empresarial canonico;
- CRT da NF-e;
- indicador de contribuinte do ICMS;
- origem da informacao;
- parametro Protheus `MV_CODREG` quando existir.

Status controlados: `DRAFT`, `PENDING_REVIEW`, `CONFIRMED`, `SUPERSEDED`, `DEACTIVATED`.

Origens controladas: `MANUAL`, `PROTHEUS_PARAMETER`, `IMPORTED_FILE`, `SYSTEM_INFERENCE`,
`FISCAL_REVIEW`.

`SYSTEM_INFERENCE` nao inicia confirmado. `PROTHEUS_PARAMETER` preserva valor original como texto.
