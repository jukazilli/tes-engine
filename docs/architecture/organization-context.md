# Organization context

Status: ACCEPTED

## Header

Rotas tenant-scoped exigem:

```text
X-Organization-ID: <uuid>
```

O nome do header e configuravel por `ORGANIZATION_HEADER_NAME`.

## Regra de matching

Quando a rota possui `:organizationId`, o valor da rota e o valor do header devem ser iguais. A API
rejeita divergencia com erro de contexto antes de consultar ou alterar dados tenant-scoped.

## Sessao

A sessao autentica o usuario. Ela nao escolhe organizacao ativa. O contexto de organizacao e sempre
por requisicao.

## Banco

Operacoes tenant-scoped executam em transacao e configuram:

```text
app.current_organization_id
app.current_user_id
```

Essas variaveis alimentam as policies RLS via funcoes `app_private.current_*`.

## Erros esperados

- contexto ausente;
- UUID invalido;
- mismatch entre rota e header;
- usuario sem membership ativa;
- permissao ausente.
