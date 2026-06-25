# Indice de ADRs

Status: ACCEPTED

Nao renumerar ADRs aceitos. Lacunas devem ser registradas, nao preenchidas artificialmente.

| Numero | Titulo                                              | Status   | Data          | Decisao resumida                           | Sucessor | Link                                                           |
| ------ | --------------------------------------------------- | -------- | ------------- | ------------------------------------------ | -------- | -------------------------------------------------------------- |
| 001    | Monorepo Nx                                         | ACCEPTED | Nao informado | Usar Nx integrado.                         | Nenhum   | [ADR-001](ADR-001-monorepo-nx.md)                              |
| 002    | Angular com PO UI                                   | ACCEPTED | Nao informado | Usar Angular e PO UI.                      | Nenhum   | [ADR-002](ADR-002-angular-po-ui.md)                            |
| 003    | NestJS para API e worker                            | ACCEPTED | Nao informado | Usar NestJS para API e worker.             | Nenhum   | [ADR-003](ADR-003-nestjs-api-worker.md)                        |
| 004    | PostgreSQL como banco local primario                | ACCEPTED | Nao informado | PostgreSQL como banco relacional local.    | Nenhum   | [ADR-004](ADR-004-postgresql-primary-database.md)              |
| 005    | Redis local                                         | ACCEPTED | Nao informado | Redis para infraestrutura local futura.    | Nenhum   | [ADR-005](ADR-005-redis-local-infrastructure.md)               |
| 006    | MinIO para armazenamento local                      | ACCEPTED | Nao informado | MinIO para object storage local.           | Nenhum   | [ADR-006](ADR-006-object-storage-minio.md)                     |
| 007    | Mailpit para e-mail local                           | ACCEPTED | Nao informado | Mailpit para e-mail de desenvolvimento.    | Nenhum   | [ADR-007](ADR-007-mailpit-development-email.md)                |
| 008    | Nx module boundaries                                | ACCEPTED | Nao informado | Tags e fronteiras Nx.                      | Nenhum   | [ADR-008](ADR-008-nx-module-boundaries.md)                     |
| 009    | Library public APIs                                 | ACCEPTED | Nao informado | Bibliotecas expoem `src/index.ts`.         | Nenhum   | [ADR-009](ADR-009-library-public-apis.md)                      |
| 010    | Framework independent engines                       | ACCEPTED | Nao informado | Engines sem Angular, PO UI ou NestJS.      | Nenhum   | [ADR-010](ADR-010-framework-independent-engines.md)            |
| 011    | Quality gates, Git hooks and continuous integration | ACCEPTED | Nao informado | Quality gates, hooks e CI.                 | Nenhum   | [ADR-011](ADR-011-quality-gates-and-ci.md)                     |
| 012    | Documentation governance and sources of truth       | ACCEPTED | 2026-06-25    | Governanca documental e fonte de verdade.  | Nenhum   | [ADR-012](ADR-012-documentation-governance.md)                 |
| 013    | Explicit typechecking                               | ACCEPTED | 2026-06-25    | Typecheck explicito para projetos Nx.      | Nenhum   | [ADR-013](ADR-013-explicit-typechecking.md)                    |
| 014    | API error contract                                  | ACCEPTED | 2026-06-25    | Contrato padronizado de erros da API.      | Nenhum   | [ADR-014](ADR-014-api-error-contract.md)                       |
| 015    | Structured logging                                  | ACCEPTED | 2026-06-25    | Logs estruturados com redaction.           | Nenhum   | [ADR-015](ADR-015-structured-logging.md)                       |
| 016    | Runtime configuration                               | ACCEPTED | 2026-06-25    | Configuracao runtime tipada e validada.    | Nenhum   | [ADR-016](ADR-016-runtime-configuration.md)                    |
| 017    | OpenAPI                                             | ACCEPTED | 2026-06-25    | OpenAPI gerado e validado para a API.      | Nenhum   | [ADR-017](ADR-017-openapi.md)                                  |
| 018    | Drizzle PostgreSQL foundation                       | ACCEPTED | 2026-06-25    | Drizzle para schema e migracoes SQL.       | Nenhum   | [ADR-018](ADR-018-drizzle-postgresql-foundation.md)            |
| 019    | Runtime and migration role separation               | ACCEPTED | 2026-06-25    | Separar DDL/migracao do runtime da API.    | Nenhum   | [ADR-019](ADR-019-runtime-migration-role-separation.md)        |
| 020    | PostgreSQL RLS tenant isolation                     | ACCEPTED | 2026-06-25    | RLS com contexto tenant transacional.      | Nenhum   | [ADR-020](ADR-020-postgresql-rls-tenant-isolation.md)          |
| 021    | Database readiness check                            | ACCEPTED | 2026-06-25    | Readiness consulta PostgreSQL runtime.     | Nenhum   | [ADR-021](ADR-021-database-readiness-check.md)                 |
| 022    | Opaque session authentication                       | ACCEPTED | 2026-06-25    | Sessao opaca, Argon2id, CSRF e e-mail.     | Nenhum   | [ADR-022](ADR-022-opaque-session-authentication.md)            |
| 023    | Explicit organization context                       | ACCEPTED | 2026-06-25    | Header explicito para selecionar tenant.   | Nenhum   | [ADR-023](ADR-023-explicit-organization-context.md)            |
| 024    | System roles and permissions                        | ACCEPTED | 2026-06-25    | Roles de sistema e permissions explicitas. | Nenhum   | [ADR-024](ADR-024-system-roles-and-permissions.md)             |
| 025    | Organization invitations                            | ACCEPTED | 2026-06-25    | Convites com token opaco e hash SHA-256.   | Nenhum   | [ADR-025](ADR-025-organization-invitations.md)                 |
| 026    | Security definer authorization functions            | ACCEPTED | 2026-06-25    | Funcoes controladas para autorizacao.      | Nenhum   | [ADR-026](ADR-026-security-definer-authorization-functions.md) |
| 027    | Last administrator protection                       | ACCEPTED | 2026-06-25    | Preservar ultimo ADMIN ativo.              | Nenhum   | [ADR-027](ADR-027-last-administrator-protection.md)            |

## Lacunas e duplicidades

- Lacunas: nenhuma entre 001 e 027.
- Duplicidades: nenhuma conhecida.
- Arquivos sem numero: este README nao e ADR.

Documentos relacionados:

- [Fonte de verdade](../governance/source-of-truth.md)
- [Template de ADR](../templates/adr-template.md)
