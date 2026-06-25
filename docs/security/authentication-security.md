# Authentication security

Status: ACCEPTED

## Segredos

Nao registrar senhas, hashes, cookies, session tokens, CSRF tokens, reset tokens, chaves Resend ou
senhas SMTP.

## Redaction

Logs redigem `password`, `newPassword`, `token`, `sessionToken`, `csrfToken`, `cookie`,
`authorization`, `resendApiKey` e `smtpPassword`.

## Rate limits

Fluxos publicos de autenticacao usam limites por janela para reduzir abuso sem bloqueio permanente.

## Sem Bearer

O corte usa somente sessao opaca persistida. Nao ha JWT, access token, refresh token ou sessao
stateless no fluxo de autenticacao.
