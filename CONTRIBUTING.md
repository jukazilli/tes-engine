# Contributing

## Environment

Use Node.js `22.12.0` and pnpm `9.11.0`.

Windows users can verify versions without NVM:

```powershell
node --version
pnpm --version
corepack --version
```

Enable Corepack before installing:

```powershell
corepack enable
corepack prepare pnpm@9.11.0 --activate
pnpm install --frozen-lockfile
```

## Branches

Use short branches that describe the change, for example:

```text
feat/project-creation
fix/worker-retry
docs/module-boundaries
```

## Commits

Commits follow Conventional Commits:

```text
type(optional-scope): description
```

Accepted types:

```text
feat fix docs style refactor perf test build ci chore revert
```

Examples:

```text
chore: add quality gates and ci
feat(projects): add project creation
fix(worker): handle processing failure
docs: update architecture map
```

## Quality

Run the full local gate before opening a PR:

```powershell
pnpm quality
```

The CI gate runs:

```powershell
pnpm format:check
pnpm architecture:validate
pnpm architecture:boundaries
pnpm lint
pnpm test
pnpm build
```

Do not run `architecture:boundaries` in parallel with lint because it creates invalid temporary
fixtures and removes them at the end.

## Architecture rules

Follow `docs/architecture/module-boundaries.md`.

- Frontend may depend on frontend and shared.
- Backend may depend on backend, shared and engines.
- Engines may depend on engines and shared.
- Shared may depend only on shared.
- Fiscal rules and deterministic engine logic must not be implemented in the frontend.

## ADRs

Create an ADR when a change affects architecture, persistence, security, runtime, CI, deployment,
boundaries or irreversible project direction.

## Execution reports

For each prompt-sized or slice-sized delivery, create or update a report under `docs/execution`.

## Secrets

Never commit `.env`, `.env.local`, credentials, tokens, certificates or production data.

Use `.env.example` for placeholders only.

## Definition of done

- The scope is implemented.
- `pnpm quality` passes.
- Required docs and ADRs are updated.
- No secrets are included.
- No unrelated files are changed.
- Risks and validation evidence are documented.

## Review

Code review should focus on behavior, architecture boundaries, test coverage, security impact and
maintainability before style. Prettier owns formatting.
