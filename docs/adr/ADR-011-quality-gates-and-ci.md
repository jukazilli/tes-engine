# ADR-011 - Quality gates, Git hooks and continuous integration

## Status

Accepted.

## Context

TES Engine already has an Nx monorepo, local infrastructure and executable module boundaries. The
project needs repeatable quality gates before product features are added.

## Decision

Use Prettier for formatting, ESLint and Nx for quality and architecture, Jest for tests, Husky and
lint-staged for staged-file checks, Commitlint for Conventional Commits and GitHub Actions for CI.

The main CI job runs without Docker or external services:

- format check;
- architecture metadata validation;
- architecture boundary fixtures;
- lint;
- tests;
- build.

## Alternatives considered

- Run all tests and builds in pre-commit: rejected because it would make local commits too slow.
- Require Docker in CI for every PR: rejected because the main quality gate should be fast and
  independent of local infrastructure.
- Use documentation-only contribution rules: rejected because hooks and CI provide executable
  enforcement.
- Enable Nx Cloud now: rejected because this prompt must not require external tokens or services.

## Consequences

Contributors get fast feedback before commit and full feedback in CI. The project gains a single
`pnpm quality` command. Some known Nx executor deprecations remain documented and intentionally
unmigrated in this prompt.
