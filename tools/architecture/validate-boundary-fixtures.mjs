import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const workspaceRoot = process.cwd();

const fixtures = [
  {
    name: 'frontend-nao-pode-depender-de-backend',
    relativePath: 'apps/web/src/__architecture_frontend_backend.invalid.ts',
    shouldPass: false,
    source: "import { normalizeServiceName } from '@tes-engine/backend/common';\n\nvoid normalizeServiceName;\n",
  },
  {
    name: 'shared-nao-pode-depender-de-engine',
    relativePath: 'libs/shared/contracts/src/__architecture_shared_engine.invalid.ts',
    shouldPass: false,
    source: "import { getEngineCoreInfo } from '@tes-engine/engines/core';\n\nvoid getEngineCoreInfo;\n",
  },
  {
    name: 'engine-nao-pode-depender-de-nestjs',
    relativePath: 'libs/engines/core/src/__architecture_engine_nest.invalid.ts',
    shouldPass: false,
    source: "import { Injectable } from '@nestjs/common';\n\nvoid Injectable;\n",
  },
  {
    name: 'backend-pode-depender-de-shared',
    relativePath: 'apps/api/src/__architecture_backend_shared.valid.ts',
    shouldPass: true,
    source: "import { HealthResponse } from '@tes-engine/shared/contracts';\n\nconst response: HealthResponse = { status: 'ok', service: 'api' };\nvoid response;\n",
  },
  {
    name: 'backend-pode-depender-de-engine',
    relativePath: 'apps/api/src/__architecture_backend_engine.valid.ts',
    shouldPass: true,
    source: "import { getEngineCoreInfo } from '@tes-engine/engines/core';\n\nvoid getEngineCoreInfo();\n",
  },
  {
    name: 'web-pode-depender-de-frontend-e-shared',
    relativePath: 'apps/web/src/__architecture_web_frontend_shared.valid.ts',
    shouldPass: true,
    source: "import { frontendUiMarker } from '@tes-engine/frontend/ui';\nimport { HealthResponse } from '@tes-engine/shared/contracts';\n\nconst response: HealthResponse = { status: 'ok', service: frontendUiMarker.library };\nvoid response;\n",
  },
];

function runEslint(relativePath) {
  return spawnSync('pnpm', ['exec', 'eslint', relativePath, '--no-cache'], {
    cwd: workspaceRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
}

const createdFiles = [];
const failures = [];

try {
  for (const fixture of fixtures) {
    const absolutePath = path.join(workspaceRoot, fixture.relativePath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, fixture.source, 'utf8');
    createdFiles.push(absolutePath);

    const result = runEslint(fixture.relativePath);
    const passed = result.status === 0;

    if (passed !== fixture.shouldPass) {
      failures.push(
        [
          `${fixture.name}: esperado ${fixture.shouldPass ? 'passar' : 'falhar'}, mas ${passed ? 'passou' : 'falhou'}`,
          result.stdout.trim(),
          result.stderr.trim(),
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }
  }
} finally {
  for (const file of createdFiles) {
    rmSync(file, { force: true });
  }
}

if (failures.length > 0) {
  console.error('Falhas na validacao de fronteiras:');
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log('Fronteiras validadas com fixtures temporarias: proibidas falham e permitidas passam.');
