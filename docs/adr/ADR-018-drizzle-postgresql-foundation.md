# ADR-018: Drizzle PostgreSQL foundation

## Status

Accepted

## Context

TES Engine needs typed access to PostgreSQL without coupling domain modules to raw SQL strings or a
framework-specific repository model.

## Decision

Use Drizzle ORM and Drizzle Kit for the PostgreSQL schema foundation.

Database code lives in `libs/backend/database` behind the public alias
`@tes-engine/backend/database`.

## Consequences

- Backend apps import a single data-access library instead of deep database paths.
- SQL migrations remain explicit and reviewable under `infrastructure/database/migrations`.
- Drizzle schema definitions provide TypeScript feedback for future repository work.
