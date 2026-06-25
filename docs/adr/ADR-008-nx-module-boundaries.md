# ADR-008 - Nx module boundaries

## Status

Accepted.

## Context

TES Engine is an Nx monorepo with browser, Node, shared and engine code. The project needs executable architecture rules before domain features are introduced.

## Decision

Use Nx project tags and `@nx/enforce-module-boundaries` as the primary dependency boundary mechanism. Every project must declare `scope:*`, `type:*` and `platform:*` tags.

Scopes define the allowed dependency matrix:

- frontend can depend on frontend and shared;
- backend can depend on backend, shared and engine;
- engine can depend on engine and shared;
- shared can depend only on shared.

## Alternatives considered

- Rely on documentation only: rejected because invalid imports would not fail automatically.
- Create separate repositories: rejected because the current project benefits from monorepo-local contracts and builds.
- Custom-only validator: rejected as the primary control because Nx already has project graph awareness.

## Consequences

Invalid project dependencies fail during lint. Some platform restrictions are enforced with complementary ESLint rules and architecture scripts.
