import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';

const workspaceRoot = process.cwd();

const expectedProjects = {
  web: {
    root: 'apps/web',
    tags: ['scope:frontend', 'type:app', 'platform:browser'],
  },
  api: {
    root: 'apps/api',
    tags: ['scope:backend', 'type:app', 'platform:node'],
  },
  worker: {
    root: 'apps/worker',
    tags: ['scope:backend', 'type:app', 'platform:node', 'runtime:worker'],
  },
  'frontend-shell': {
    root: 'libs/frontend/shell',
    tags: ['scope:frontend', 'type:shell', 'platform:browser'],
  },
  'frontend-ui': {
    root: 'libs/frontend/ui',
    tags: ['scope:frontend', 'type:ui', 'platform:browser'],
  },
  'backend-common': {
    root: 'libs/backend/common',
    tags: ['scope:backend', 'type:util', 'platform:node'],
  },
  'backend-database': {
    root: 'libs/backend/database',
    tags: ['scope:backend', 'type:data-access', 'platform:node'],
  },
  'backend-organizations': {
    root: 'libs/backend/organizations',
    tags: ['scope:backend', 'type:feature', 'platform:node'],
  },
  'backend-companies': {
    root: 'libs/backend/companies',
    tags: ['scope:backend', 'type:feature', 'platform:node'],
  },
  'backend-protheus-environments': {
    root: 'libs/backend/protheus-environments',
    tags: ['scope:backend', 'type:feature', 'platform:node'],
  },
  'shared-contracts': {
    root: 'libs/shared/contracts',
    tags: ['scope:shared', 'type:contracts', 'platform:agnostic'],
  },
  'shared-domain-types': {
    root: 'libs/shared/domain-types',
    tags: ['scope:shared', 'type:domain', 'platform:agnostic'],
  },
  'shared-testing': {
    root: 'libs/shared/testing',
    tags: ['scope:shared', 'type:testing', 'platform:agnostic'],
  },
  'engine-core': {
    root: 'libs/engines/core',
    tags: ['scope:engine', 'type:domain', 'platform:agnostic'],
  },
};

const expectedAliases = {
  '@tes-engine/frontend/shell': './libs/frontend/shell/src/index.ts',
  '@tes-engine/frontend/ui': './libs/frontend/ui/src/index.ts',
  '@tes-engine/backend/common': './libs/backend/common/src/index.ts',
  '@tes-engine/backend/database': './libs/backend/database/src/index.ts',
  '@tes-engine/backend/organizations': './libs/backend/organizations/src/index.ts',
  '@tes-engine/backend/companies': './libs/backend/companies/src/index.ts',
  '@tes-engine/backend/protheus-environments': './libs/backend/protheus-environments/src/index.ts',
  '@tes-engine/shared/contracts': './libs/shared/contracts/src/index.ts',
  '@tes-engine/shared/domain-types': './libs/shared/domain-types/src/index.ts',
  '@tes-engine/shared/testing': './libs/shared/testing/src/index.ts',
  '@tes-engine/engines/core': './libs/engines/core/src/index.ts',
};

const allowedAliases = new Set(Object.keys(expectedAliases));
const nodeBuiltins = new Set([
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
]);

const errors = [];

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(workspaceRoot, relativePath), 'utf8'));
}

function walk(dir, predicate, output = []) {
  if (!existsSync(dir)) {
    return output;
  }

  for (const entry of readdirSync(dir)) {
    const absolute = path.join(dir, entry);
    const stats = statSync(absolute);

    if (stats.isDirectory()) {
      if (!['node_modules', 'dist', 'coverage', '.nx'].includes(entry)) {
        walk(absolute, predicate, output);
      }
      continue;
    }

    if (predicate(absolute)) {
      output.push(absolute);
    }
  }

  return output;
}

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function projectForFile(file, projects) {
  const relative = normalizePath(path.relative(workspaceRoot, file));
  return projects.find((project) => relative.startsWith(`${project.root}/`));
}

function resolveRelativeImport(file, specifier) {
  const base = path.resolve(path.dirname(file), specifier);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, 'index.ts')];

  return candidates.find((candidate) => existsSync(candidate));
}

function extractImports(source) {
  const imports = [];
  const patterns = [
    /import\s+(?:type\s+)?(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /export\s+(?:type\s+)?[^'"]+?\s+from\s+['"]([^'"]+)['"]/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      imports.push(match[1]);
    }
  }

  return imports;
}

const projectFiles = walk(workspaceRoot, (file) => path.basename(file) === 'project.json')
  .map((file) => normalizePath(path.relative(workspaceRoot, file)))
  .filter((file) => file.startsWith('apps/') || file.startsWith('libs/'));

const projects = projectFiles.map((projectFile) => {
  const project = readJson(projectFile);
  return {
    name: project.name,
    root: normalizePath(path.dirname(projectFile)),
    sourceRoot: normalizePath(project.sourceRoot),
    projectType: project.projectType,
    tags: project.tags ?? [],
  };
});

for (const [name, expected] of Object.entries(expectedProjects)) {
  const project = projects.find((candidate) => candidate.name === name);

  if (!project) {
    errors.push(`Projeto esperado nao encontrado: ${name}`);
    continue;
  }

  if (project.root !== expected.root) {
    errors.push(`${name}: root esperado ${expected.root}, encontrado ${project.root}`);
  }

  for (const prefix of ['scope:', 'type:', 'platform:']) {
    if (!project.tags.some((tag) => tag.startsWith(prefix))) {
      errors.push(`${name}: tag obrigatoria ausente com prefixo ${prefix}`);
    }
  }

  for (const tag of expected.tags) {
    if (!project.tags.includes(tag)) {
      errors.push(`${name}: tag esperada ausente ${tag}`);
    }
  }
}

for (const project of projects) {
  const publicApi = path.join(workspaceRoot, project.sourceRoot, 'index.ts');

  if (project.projectType === 'library' && !existsSync(publicApi)) {
    errors.push(`${project.name}: biblioteca sem API publica em src/index.ts`);
  }
}

const tsconfig = readJson('tsconfig.base.json');
const paths = tsconfig.compilerOptions?.paths ?? {};

for (const [alias, target] of Object.entries(expectedAliases)) {
  const configured = paths[alias]?.[0];

  if (configured !== target) {
    errors.push(`${alias}: path esperado ${target}, encontrado ${configured ?? '<ausente>'}`);
  }
}

const sourceFiles = walk(workspaceRoot, (file) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)).filter(
  (file) => {
    const relative = normalizePath(path.relative(workspaceRoot, file));
    return (
      (relative.startsWith('apps/') || relative.startsWith('libs/')) &&
      !relative.includes('/node_modules/') &&
      !relative.includes('/dist/')
    );
  },
);

for (const file of sourceFiles) {
  const project = projectForFile(file, projects);

  if (!project) {
    continue;
  }

  const relativeFile = normalizePath(path.relative(workspaceRoot, file));
  const source = readFileSync(file, 'utf8');
  const imports = extractImports(source);

  for (const specifier of imports) {
    if (specifier.startsWith('@tes-engine/')) {
      const publicAlias = [...allowedAliases].find((alias) => specifier === alias);

      if (!publicAlias) {
        errors.push(
          `${relativeFile}: import deve usar API publica conhecida, encontrado ${specifier}`,
        );
      }
    }

    if (specifier.startsWith('.')) {
      const resolved = resolveRelativeImport(file, specifier);

      if (resolved) {
        const targetProject = projectForFile(resolved, projects);

        if (targetProject && targetProject.name !== project.name) {
          errors.push(
            `${relativeFile}: import relativo cruza projetos (${project.name} -> ${targetProject.name})`,
          );
        }
      }
    }

    if (
      project.tags.includes('platform:agnostic') &&
      (/^@angular\//.test(specifier) || /^@po-ui\//.test(specifier) || /^@nestjs\//.test(specifier))
    ) {
      errors.push(`${relativeFile}: projeto agnostico nao pode importar ${specifier}`);
    }

    if (project.tags.includes('scope:engine') && /^@nestjs\//.test(specifier)) {
      errors.push(`${relativeFile}: engine nao pode importar ${specifier}`);
    }

    if (project.tags.includes('platform:browser') && nodeBuiltins.has(specifier)) {
      errors.push(`${relativeFile}: projeto browser nao pode importar API Node ${specifier}`);
    }

    if (project.tags.includes('platform:node') && /^@po-ui\//.test(specifier)) {
      errors.push(`${relativeFile}: projeto Node nao pode importar PO UI ${specifier}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Falhas de arquitetura encontradas:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Arquitetura validada: ${projects.length} projetos com tags, APIs publicas e imports consistentes.`,
);
