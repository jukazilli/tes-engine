# ADR-010 - Framework independent engines

## Status

Accepted.

## Context

The future fiscal and TES engines must be deterministic and portable. Coupling them to Angular, PO UI or NestJS would make rules harder to test and reuse.

## Decision

Engine libraries use `scope:engine` and `platform:agnostic`. They may depend only on engine and shared libraries and must not import Angular, PO UI or NestJS.

## Alternatives considered

- Implement engine logic inside the API: rejected because it would couple domain rules to NestJS.
- Implement engine logic in the frontend: rejected because fiscal rules must not depend on UI runtime.
- Allow framework adapters inside engine libraries: rejected for now; adapters should live in backend or frontend layers.

## Consequences

The engine layer stays pure TypeScript. Framework integration must happen at the application or adapter boundary in future prompts.
