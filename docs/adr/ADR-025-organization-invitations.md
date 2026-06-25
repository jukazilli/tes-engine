# ADR-025: Organization invitations

Status: ACCEPTED

Data: 2026-06-25

## Contexto

Membros devem entrar em organizacoes por convite, sem criar empresas, filiais, projetos ou
integracoes Protheus neste corte.

## Decisao

Convites usam token opaco gerado por `crypto.randomBytes(32)` em `base64url`. Somente o hash
`SHA-256` do token e persistido. Convites possuem expiracao, status, papel pretendido e limite de
reenvio em memoria.

## Consequencias

- Tokens de convite nao entram em logs nem relatorios.
- Aceite de convite valida token, status, expiracao e e-mail do usuario autenticado.
- Reenvio e revogacao preservam trilha de status.
- Rate limiting em memoria deve evoluir antes de multiplas instancias.

## Relacoes

- Relacionado a: [ADR-022](ADR-022-opaque-session-authentication.md)
- Relacionado a: [ADR-024](ADR-024-system-roles-and-permissions.md)
