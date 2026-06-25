# Testing strategy

## Purpose

TES Engine uses tests to protect deterministic behavior, module boundaries and integration contracts
without coupling early prompts to future domain features.

## Unit tests

Unit tests cover pure functions, small services and library public APIs. They should be
deterministic and avoid network, Docker and filesystem side effects unless the unit explicitly owns
that behavior.

## Integration tests

Integration tests validate collaboration between modules or framework components. API tests may use
NestJS testing utilities. Future database integration tests must use isolated data and explicit
setup/teardown.

## Contract tests

Shared contracts should be tested where they define stable request or response shapes. The current
`HealthResponse` contract is intentionally minimal.

## E2E tests

E2E tests are future scope. They should cover critical browser and API flows after real product
workflows exist.

## Golden files

Golden files are future scope for fiscal outputs, parser outputs and deterministic exports. Golden
files must be reviewed carefully and should not contain real customer data or fiscal documents.

## Security tests

Security tests are future scope. Expected areas include authentication, authorization, upload
validation, tenant isolation, object storage access and audit trails.

## Layer responsibilities

- Frontend tests validate UI behavior and browser integration.
- Backend tests validate HTTP behavior, orchestration and server utilities.
- Engine tests validate deterministic rules without Angular, PO UI or NestJS.
- Shared tests validate contracts, portable domain types and testing utilities.

## Mocking policy

Do not mock the code under test. Mock external boundaries such as network, clock, UUID generation,
storage, email and queues when deterministic behavior requires it.

## Determinism

Tests must not depend on current time, random values, environment order or local machine state
unless those values are controlled.

When tests need time, UUIDs or randomness, inject them or wrap them behind a small boundary that can
be fixed in tests.

## Coverage

No arbitrary global coverage threshold is enforced in this prompt. Thresholds will be defined when
the first real domain modules are implemented and the risk profile is clearer.
