# ADR-023: Explicit organization context

Status: ACCEPTED

Data: 2026-06-25

## Contexto

O Prompt 09 introduz organizacoes, memberships e autorizacao tenant-aware. A sessao autenticada
identifica o usuario, mas nao escolhe implicitamente uma organizacao ativa.

## Decisao

Rotas tenant-scoped exigem contexto explicito por `X-Organization-ID`. Quando a rota tambem contem
`:organizationId`, o valor da rota deve ser igual ao header. A API rejeita contexto ausente,
malformado, inativo ou divergente antes de executar regras de negocio.

## Consequencias

- A sessao nao carrega organizacao implicita.
- Chamadas cross-tenant falham antes da operacao de dominio.
- O contexto PostgreSQL continua transacional e explicito.
- Clientes devem enviar `X-Organization-ID` em operacoes tenant-scoped.

## Relacoes

- Relacionado a: [ADR-020](ADR-020-postgresql-rls-tenant-isolation.md)
- Relacionado a: [ADR-022](ADR-022-opaque-session-authentication.md)
