# ADR-019: Runtime and migration role separation

## Status

Accepted

## Context

Application code must not run with schema-owner or superuser privileges.

## Decision

Use `DATABASE_MIGRATION_URL` only for bootstrap and migrations. Use `DATABASE_URL` for application
runtime access through a least-privilege role created by `pnpm db:bootstrap`.

The runtime role is configured without superuser, database creation, role creation or RLS bypass
privileges.

## Consequences

- Migration scripts can apply DDL while the API runs with limited DML grants.
- CI provisions both roles before executing quality gates.
- Local `.env.local` must keep the two URLs separate.
