# Authentication testing

Status: ACCEPTED

## Comandos

- `pnpm test:auth`
- `pnpm test:email`
- `pnpm auth:cleanup`

Organizacoes, RBAC e convites possuem comandos proprios em
[Organization testing](organization-testing.md).

## Local

Use Mailpit em `http://localhost:8025` para validar confirmacao de e-mail e reset de senha. Nunca
registre tokens ou senhas em relatorios.

## CI

CI deve usar:

```text
EMAIL_PROVIDER=fake
```

O provider fake captura mensagens em memoria e nao faz rede.
