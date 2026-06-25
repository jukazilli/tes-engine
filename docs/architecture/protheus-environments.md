# Ambientes Protheus

Status: ACCEPTED

Ambiente Protheus representa uma configuracao logica relacionada a uma filial. O MVP nao se conecta
ao Protheus e nao armazena URL interna, usuario, senha, token ou credenciais.

## Modelo

Campos principais:

- `branch_id`;
- `name`;
- `environment_type`: `DEVELOPMENT`, `HOMOLOGATION`, `PRODUCTION`, `OTHER`;
- `protheus_product`: sempre `PROTHEUS`;
- `protheus_major_version` e `protheus_release` como texto;
- `protheus_company_code` e `protheus_branch_code` como texto.

Nome ativo por filial e combinacao ativa de tipo/codigos Protheus sao unicos. Atualizacoes usam
`version`; desativacao e logica e nao remove o registro.

## Escopo futuro

Estrategia tributaria do ambiente, snapshots SX3/SF4, importacao SX6, MILE e motor fiscal ficam fora
deste corte.
