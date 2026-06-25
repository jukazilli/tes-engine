# Module boundaries

## Layer map

```text
apps
  web
  api
  worker
libs
  frontend
    shell
    ui
  backend
    common
  shared
    contracts
    domain-types
    testing
  engines
    core
```

## Tags

Every Nx project must declare one `scope:*`, one `type:*` and one `platform:*` tag.

| Project               | Tags                                                           |
| --------------------- | -------------------------------------------------------------- |
| `web`                 | `scope:frontend`, `type:app`, `platform:browser`               |
| `api`                 | `scope:backend`, `type:app`, `platform:node`                   |
| `worker`              | `scope:backend`, `type:app`, `platform:node`, `runtime:worker` |
| `frontend-shell`      | `scope:frontend`, `type:shell`, `platform:browser`             |
| `frontend-ui`         | `scope:frontend`, `type:ui`, `platform:browser`                |
| `backend-common`      | `scope:backend`, `type:util`, `platform:node`                  |
| `shared-contracts`    | `scope:shared`, `type:contracts`, `platform:agnostic`          |
| `shared-domain-types` | `scope:shared`, `type:domain`, `platform:agnostic`             |
| `shared-testing`      | `scope:shared`, `type:testing`, `platform:agnostic`            |
| `engine-core`         | `scope:engine`, `type:domain`, `platform:agnostic`             |

## Allowed dependencies

| Source scope     | May depend on                                   |
| ---------------- | ----------------------------------------------- |
| `scope:frontend` | `scope:frontend`, `scope:shared`                |
| `scope:backend`  | `scope:backend`, `scope:shared`, `scope:engine` |
| `scope:engine`   | `scope:engine`, `scope:shared`                  |
| `scope:shared`   | `scope:shared`                                  |

## Forbidden dependencies

| Source scope     | Must not depend on                                |
| ---------------- | ------------------------------------------------- |
| `scope:frontend` | `scope:backend`, `scope:engine`                   |
| `scope:backend`  | `scope:frontend`                                  |
| `scope:engine`   | `scope:frontend`, `scope:backend`                 |
| `scope:shared`   | `scope:frontend`, `scope:backend`, `scope:engine` |

Additional rules:

- `platform:agnostic` libraries must not import Angular, PO UI or NestJS.
- `platform:browser` projects must not import Node-only built-ins.
- `platform:node` projects must not import PO UI.
- `type:ui` must not depend on `type:app`.
- Libraries must expose a public API through `src/index.ts`.
- Imports across projects must use public aliases instead of deep paths or relative paths.
- Engines must remain framework independent. Fiscal domain code must not depend on Angular, PO UI or
  NestJS.

## Public aliases

Use these aliases for cross-project imports:

```typescript
import { frontendUiMarker } from '@tes-engine/frontend/ui';
import { normalizeServiceName } from '@tes-engine/backend/common';
import { HealthResponse } from '@tes-engine/shared/contracts';
import { EntityId } from '@tes-engine/shared/domain-types';
import { createTestLabel } from '@tes-engine/shared/testing';
import { getEngineCoreInfo } from '@tes-engine/engines/core';
```

Invalid examples:

```typescript
import { normalizeServiceName } from '@tes-engine/backend/common/src/lib/backend-common';
import { getEngineCoreInfo } from '../../../libs/engines/core/src/lib/engine-core';
```

## Creating a new library

1. Choose the layer first: frontend, backend, shared or engines.
2. Choose `scope:*` from the layer.
3. Choose `type:*` by responsibility, not by current implementation detail.
4. Choose `platform:*` from runtime constraints:
   - `platform:browser` for Angular/browser code.
   - `platform:node` for NestJS/server code.
   - `platform:agnostic` for portable TypeScript.
5. Add `src/index.ts` and export only the public surface.
6. Add a path alias in `tsconfig.base.json`.
7. Run architecture validation before committing.

## Validation commands

```powershell
pnpm architecture:validate
pnpm architecture:boundaries
pnpm lint
pnpm quality
```

`architecture:validate` checks required tags, expected tags, public aliases, public APIs, deep
imports, relative cross-project imports and framework restrictions.

`architecture:boundaries` creates temporary fixtures, runs ESLint and removes the fixtures. It
proves that:

- frontend cannot depend on backend;
- shared cannot depend on engine;
- engine cannot depend on NestJS;
- backend can depend on shared;
- backend can depend on engine;
- web can depend on frontend and shared.

## Interpreting errors

- `@nx/enforce-module-boundaries`: the import violates a dependency rule between Nx projects.
- `no-restricted-imports`: the import violates a platform/framework rule.
- `architecture:validate`: the project metadata or import shape is inconsistent with this document.

## Future features

Future prompts may add auth, database access, queues, upload, XML parsing, fiscal rules, wizard
flows and exports. Those features must follow these boundaries instead of weakening them.
