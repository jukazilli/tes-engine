# ADR-009 - Library public APIs

## Status

Accepted.

## Context

Libraries need stable import surfaces so applications and other libraries do not depend on internal file layouts.

## Decision

Every library exposes its public API from `src/index.ts`. Cross-project imports use the `@tes-engine/...` aliases configured in `tsconfig.base.json`.

Deep imports and relative imports that cross project roots are prohibited by architecture validation.

## Alternatives considered

- Allow imports from `src/lib/*`: rejected because it couples consumers to internal structure.
- Use relative imports across libraries: rejected because it bypasses Nx project boundaries.
- Export all files by default: rejected because it exposes implementation details.

## Consequences

Internal library files can change without forcing consumers to update. New public exports must be intentional.
