# ADR-026: Security definer authorization functions

Status: ACCEPTED

Data: 2026-06-25

## Contexto

RLS protege tabelas tenant-scoped, mas a API tambem precisa consultar organizacoes e permissoes de
um usuario antes de selecionar o tenant da requisicao.

## Decisao

Criar funcoes `SECURITY DEFINER` em `app_private` para consultas controladas de autorizacao:

- `app_private.organizations_for_user(uuid)`
- `app_private.can_access_organization(uuid, uuid)`
- `app_private.permissions_for_user(uuid, uuid)`

As funcoes desligam RLS internamente apenas para essas leituras controladas e nao sao concedidas ao
publico.

## Consequencias

- A API consegue validar acesso antes de executar operacoes tenant-scoped.
- A superficie privilegiada fica limitada a funcoes pequenas e auditaveis.
- Mudancas nas funcoes devem ser tratadas como mudancas de seguranca.

## Relacoes

- Relacionado a: [ADR-019](ADR-019-runtime-migration-role-separation.md)
- Relacionado a: [ADR-020](ADR-020-postgresql-rls-tenant-isolation.md)
