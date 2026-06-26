# Resolucao de conflitos de pesquisa

Status: ACCEPTED

## Tipos comuns

- Fonte oficial versus catalogo tecnico.
- Ambiente Protheus do tenant versus catalogo generico.
- XSD oficial versus exemplo XML sintetico.
- Release TOTVS antiga versus release atual.

## Politica

Conflitos devem ser registrados antes de uma decisao aceita. A resolucao deve apontar o criterio
usado:

- `RESOLVED_BY_AUTHORITY`;
- `RESOLVED_BY_ENVIRONMENT`;
- `ACCEPTED_LIMITATION`;
- `DEFERRED`.

Conflitos `OPEN` nao podem sustentar decisao final de implementacao.
