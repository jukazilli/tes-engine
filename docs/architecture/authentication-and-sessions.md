# Authentication and sessions

Status: ACCEPTED

## Decisao

A autenticacao do TES Engine usa senha com Argon2id, sessao opaca persistida no PostgreSQL e cookie
HttpOnly. O token Bearer assinado com HMAC da tentativa parcial foi removido.

## Senhas

- Algoritmo: Argon2id.
- Politica: minimo 12 e maximo 128 caracteres.
- Hash encapsula salt e parametros.
- Senhas e hashes nao entram em logs.

## Sessoes

- Token gerado com `crypto.randomBytes(32)` em `base64url`.
- Somente `SHA-256(sessionToken)` e armazenado em `app.user_sessions`.
- Cookie `tes_session` e HttpOnly, `SameSite=Lax`, `Path=/` e `Secure` conforme ambiente.
- Sessao nao e armazenada em memoria.

## CSRF

`GET /api/auth/csrf` emite token CSRF vinculado a sessao. Operacoes mutaveis autenticadas exigem
`X-CSRF-Token` e validam `Origin` quando presente.

## Recuperacao de senha

Tokens de reset sao opacos, persistidos apenas como hash, expiram e sao de uso unico. Reset revoga
sessoes ativas.

## Funcao de organizacao

`app_private.active_organization_for_user(uuid)` existe por preparacao da tentativa parcial e nao e
usada neste corte. Ela nao autentica usuario, nao configura tenant e nao substitui autorizacao.
