# Vigencia de claims de pesquisa

Status: ACCEPTED

Claims podem ter vigencia propria para registrar quando uma interpretacao foi aceita. Essa vigencia
serve para governanca de conhecimento.

## Regras

- `effectiveFrom` nao pode ser posterior a `effectiveUntil`.
- Claims por `RELEASE` devem indicar a release e a limitacao de release.
- Claims por `STATE` devem indicar pais e UF.
- Claims por `TENANT_ENVIRONMENT` devem apontar o ambiente ou classe de snapshot.

## Relacao com dominio fiscal

A vigencia de pesquisa nao substitui:

- vigencia de perfil fiscal da filial;
- vigencia de estrategia tributaria;
- vigencia legal de notas tecnicas, leis ou ajustes estaduais.
