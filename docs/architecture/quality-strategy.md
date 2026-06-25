# Quality strategy

## Quality pyramid

TES Engine starts with fast local checks, deterministic unit tests and architecture boundaries.
Broader integration, E2E, security and fiscal golden-file tests will be added when the product
surface exists.

## Formatting

Prettier owns formatting for TypeScript, JavaScript, JSON, HTML, SCSS, Markdown and YAML.

Use:

```powershell
pnpm format
pnpm format:check
```

Generated output, caches, binary screenshots and local environment files are ignored.

## Lint

ESLint owns quality and architecture concerns. It preserves Nx module boundaries and platform
restrictions. Prettier owns style, so ESLint should not grow excessive stylistic rules.

## Boundaries

Architecture validation has two layers:

- `architecture:validate` checks metadata, public APIs, public aliases and import shape.
- `architecture:boundaries` creates temporary invalid and valid fixtures to prove ESLint boundaries
  are active.

Run boundary validation sequentially. Do not run it in parallel with lint.

## Tests

Jest remains the baseline test runner. Tests should be deterministic and scoped to the layer they
validate.

## Builds

Builds verify that web, API, worker and libraries compile with the current Nx setup.

## CI

GitHub Actions runs the main quality gate on pull requests and pushes to `main`, `develop` and
`master`. The current local branch is `master`, so the workflow keeps compatibility with that branch
while supporting future `main` or `develop` usage.

The CI job does not require Docker, database, Redis, MinIO, Mailpit, secrets or deploy credentials.

## Hooks

Husky and lint-staged provide fast pre-commit checks for staged files only. Commitlint validates
commit messages with Conventional Commits.

Hooks do not run full builds or all tests.

## Human review

Human review remains required for architecture, risk, product behavior, security, fiscal correctness
and maintainability.

## ADRs

Create ADRs for decisions that affect long-lived architecture, runtime, persistence, CI, security or
domain boundaries.

## Security

Current quality gates prevent committing local environment files and require PR authors to declare
security impact. Future prompts should add dependency audit and secret scanning when the security
surface grows.

## Local versus CI

Local quality may include infrastructure checks when needed. CI quality intentionally avoids Docker
and local services for the main job.

## Known Nx deprecations

Nx reports deprecation warnings for `@nx/jest:jest` and `@nx/eslint:lint` ahead of Nx v24. These are
documented risks and will be migrated in a separate scoped prompt.
