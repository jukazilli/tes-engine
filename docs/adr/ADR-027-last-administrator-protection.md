# ADR-027: Last administrator protection

Status: ACCEPTED

Data: 2026-06-25

## Contexto

Organizacoes precisam manter ao menos um administrador ativo para evitar lockout operacional.

## Decisao

Operacoes que removem, suspendem, revogam ou reduzem papel administrativo de um membro validam a
existencia de outro administrador ativo na mesma organizacao. A validacao ocorre em transacao e usa
bloqueio de linhas relacionadas quando necessario.

## Consequencias

- O ultimo administrador ativo nao pode ser removido ou perder o papel `ADMIN`.
- Desativacao de organizacao tambem exige administrador ativo.
- Clientes devem promover outro administrador antes de remover o ultimo.

## Relacoes

- Relacionado a: [ADR-024](ADR-024-system-roles-and-permissions.md)
