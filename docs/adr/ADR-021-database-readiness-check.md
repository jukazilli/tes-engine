# ADR-021: Database readiness check

## Status

Accepted

## Context

The API needs separate liveness and readiness behavior. Liveness should not depend on
infrastructure, but readiness must reflect whether runtime dependencies can serve traffic.

## Decision

Keep `/health/live` process-only. Make `/health/ready` execute `SELECT 1` through the PostgreSQL
runtime pool and return HTTP 503 when the database is unavailable or the application is not
initialized.

## Consequences

- Orchestrators can restart only dead processes while avoiding traffic to unready instances.
- OpenAPI documents the `ready` and `not_ready` readiness states.
