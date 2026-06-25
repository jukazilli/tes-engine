# ADR-022: Opaque session authentication

Status: ACCEPTED

Data: 2026-06-25

## Contexto

A tentativa parcial do Prompt 08 usava scrypt e token Bearer proprio assinado com HMAC. O corte
corretivo 08.1 exige Argon2id, sessao opaca persistida, cookie HttpOnly, CSRF e recuperacao de
senha.

## Decisao

Usar Argon2id para senhas e sessoes opacas persistidas em PostgreSQL. O navegador recebe apenas
cookie HttpOnly. Operacoes mutaveis autenticadas exigem CSRF. E-mail passa por adapter com SMTP,
Resend opcional e fake provider para testes.

## Consequencias

- A API nao retorna access token.
- Sessao pode ser revogada no banco.
- Fluxos multi-instancia devem evoluir rate limiting para armazenamento distribuido.
- Organizacoes, convites e RBAC permanecem fora deste corte.
