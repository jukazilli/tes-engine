# ADR-029: Identificadores fiscais brasileiros

Status: ACCEPTED

Data: 2026-06-25

## Decisao

CNPJ e raiz de CNPJ sao armazenados sem pontuacao. CNPJ completo deve passar validacao de digitos
verificadores na aplicacao e constraints de formato no banco.

## Consequencias

Inscricoes estadual e municipal permanecem texto para preservar zeros e formatos futuros por UF.
