# Ciclo de vida de pesquisa

Status: ACCEPTED

| Status                      | Significado                                    |
| --------------------------- | ---------------------------------------------- |
| `DRAFT`                     | Rascunho ainda nao revisado.                   |
| `UNDER_REVIEW`              | Pronto para revisao tecnica.                   |
| `VERIFIED`                  | Confirmado por fonte suficiente para o escopo. |
| `VERIFIED_WITH_LIMITATIONS` | Confirmado, mas com restricoes explicitas.     |
| `REJECTED`                  | Nao aceito.                                    |
| `SUPERSEDED`                | Substituido por registro mais novo.            |
| `OBSOLETE`                  | Nao deve ser usado em novas decisoes.          |

## Obsolescencia

Claims com fonte vendor, schema ou release devem ser revisados quando houver nova release, nova nota
tecnica, novo snapshot de ambiente ou conflito aberto.

## Vigencia

`effectiveFrom` e `effectiveUntil` descrevem a janela em que a claim pode ser usada. A vigencia da
claim nao substitui vigencia legal nem vigencia de estrategia tributaria.
