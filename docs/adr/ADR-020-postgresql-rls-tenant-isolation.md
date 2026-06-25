# ADR-020: PostgreSQL RLS tenant isolation

## Status

Accepted

## Context

Tenant isolation must be enforced consistently across API code paths and future workers.

## Decision

Use PostgreSQL row-level security on tenant-scoped tables. Tenant context is stored in
transaction-local settings and read through null-safe functions in `app_private`.

## Consequences

- Missing or invalid tenant context returns no tenant rows.
- Cross-tenant reads and writes are blocked by PostgreSQL.
- Tests must include RLS behavior, not only application-level filters.
