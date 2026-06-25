# Pull request

## Objective

Describe the problem this PR solves.

## Scope

List what is included and what is intentionally out of scope.

## Changes

-

## How to validate

```powershell
pnpm quality
```

## Evidence

Attach command output, screenshots or links that prove the change.

## Risks

Describe migration, rollback, compatibility or operational risks.

## Migrations

State whether database or data migrations are included. Use `None` when not applicable.

## Multi-tenant impact

State whether tenant isolation, organization data or permissions are affected.

## Security impact

State whether auth, secrets, permissions, uploads or external integrations are affected.

## Fiscal engine impact

State whether deterministic fiscal logic or TES rules are affected. Fiscal rules must not be placed
in the frontend.

## Checklist

- [ ] `pnpm format:check`
- [ ] `pnpm architecture:validate`
- [ ] `pnpm architecture:boundaries`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] No secrets, credentials or local `.env` files were included.
- [ ] Execution report updated in `docs/execution` when applicable.
