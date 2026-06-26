# Governanca de fontes de pesquisa

Status: ACCEPTED

## Objetivo

Toda regra fiscal, contrato de campo Protheus ou decisao de importacao deve nascer de pergunta,
fonte, evidencia, claim e decisao rastreaveis. O Prompt 11.5A cria esse fluxo sem implementar motor
fiscal, ingestao SX3, importacao XML ou catalogo completo Protheus.

## Taxonomia de autoridade

| Nivel                  | Uso                                                              |
| ---------------------- | ---------------------------------------------------------------- |
| `PRIMARY_NORMATIVE`    | Leis, portais oficiais, schemas e notas tecnicas oficiais.       |
| `PRIMARY_VENDOR`       | Documentacao oficial TOTVS/TDN ou central oficial TOTVS.         |
| `ENVIRONMENT_SNAPSHOT` | Snapshot confirmado de ambiente Protheus do tenant.              |
| `INTERNAL_DECISION`    | ADR, arquitetura e decisao interna aceita.                       |
| `SECONDARY_TECHNICAL`  | Catalogos tecnicos de terceiros, blogs e referencias auxiliares. |
| `COMMUNITY_REFERENCE`  | Comunidade, gist, forum e material sem autoridade primaria.      |

## Fluxo minimo

1. Registrar `question`.
2. Registrar `source`.
3. Registrar `evidence` com resumo curto e localizador.
4. Registrar `claim` com escopo, vigencia e limitacoes.
5. Resolver `conflict` quando fontes divergirem.
6. Aceitar `decision` antes de transformar claim em implementacao.

## Regras

- Fonte secundaria nunca vira regra normativa sozinha.
- Catalogo SF4 publico ajuda descoberta, mas SX3 confirmado do ambiente prevalece.
- XML sintetico pode validar formato de teste, mas nao prova regra fiscal.
- Claims `VERIFIED` ou `VERIFIED_WITH_LIMITATIONS` exigem evidencia e revisor.
- Claims estaduais exigem `country` e `state`.
- Claims por release exigem release e limitacao explicita.

## Comandos

- `pnpm research:validate`
- `pnpm research:links`
- `pnpm test:research-governance`
