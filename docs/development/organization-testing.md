# Organization testing

Status: ACCEPTED

## Comandos

- `pnpm test:organizations`
- `pnpm test:rbac`
- `pnpm test:invitations`
- `pnpm test:tenant-authorization`
- `pnpm test:db:rls`
- `pnpm db:validate`

## Banco

Antes de testar localmente, mantenha migrations aplicadas:

```text
pnpm db:migrate
```

`pnpm db:validate` verifica tabelas, RLS, policies, grants e funcoes de autorizacao.

## API

Rotas tenant-scoped exigem cookie de sessao, CSRF em operacoes mutaveis e `X-Organization-ID`.

## Seguranca dos testes manuais

Nao registre tokens de sessao, tokens CSRF, tokens de convite, senhas ou hashes em relatorios.
Arquivos temporarios de validacao manual devem ser removidos antes de commit.
