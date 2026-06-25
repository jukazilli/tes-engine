import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const workspaceRoot = process.cwd();
const workflowsRoot = path.join(workspaceRoot, '.github', 'workflows');
const errors = [];

const requiredCommands = [
  'pnpm install --frozen-lockfile',
  'pnpm format:check',
  'pnpm docs:validate',
  'pnpm architecture:validate',
  'pnpm architecture:boundaries',
  'pnpm typecheck:coverage',
  'pnpm typecheck',
  'pnpm lint',
  'pnpm test',
  'pnpm build',
];

const forbiddenText = [
  '.env.local',
  'secrets.',
  'docker compose',
  'docker-compose',
  'kubectl',
  'terraform',
  'vercel',
  'render deploy',
  'npm publish',
  'pnpm publish',
  'rm -rf',
  'Remove-Item -Recurse',
  'git reset --hard',
  'git clean -fd',
];

function listWorkflowFiles() {
  if (!existsSync(workflowsRoot)) {
    return [];
  }

  return readdirSync(workflowsRoot)
    .map((entry) => path.join(workflowsRoot, entry))
    .filter((file) => statSync(file).isFile() && /\.(ya?ml)$/i.test(file));
}

function collectStrings(value, output = []) {
  if (typeof value === 'string') {
    output.push(value);
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, output);
    }
    return output;
  }

  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      collectStrings(item, output);
    }
  }

  return output;
}

function workflowUses(workflow, actionPrefix) {
  return collectStrings(workflow).some((value) => value.startsWith(actionPrefix));
}

const files = listWorkflowFiles();

if (files.length === 0) {
  errors.push('Nenhum workflow YAML encontrado em .github/workflows.');
}

for (const file of files) {
  const relativeFile = path.relative(workspaceRoot, file).replaceAll('\\', '/');
  const source = readFileSync(file, 'utf8');
  let workflow;

  try {
    workflow = YAML.parse(source);
  } catch (error) {
    errors.push(`${relativeFile}: YAML invalido: ${error.message}`);
    continue;
  }

  if (!workflow || typeof workflow !== 'object') {
    errors.push(`${relativeFile}: workflow vazio ou invalido.`);
    continue;
  }

  if (!workflowUses(workflow, 'actions/checkout@')) {
    errors.push(`${relativeFile}: actions/checkout ausente.`);
  }

  if (!workflowUses(workflow, 'actions/setup-node@')) {
    errors.push(`${relativeFile}: actions/setup-node ausente.`);
  }

  const allStrings = collectStrings(workflow);
  const joined = allStrings.join('\n');

  for (const command of requiredCommands) {
    if (!joined.includes(command)) {
      errors.push(`${relativeFile}: comando obrigatorio ausente: ${command}`);
    }
  }

  for (const forbidden of forbiddenText) {
    if (joined.includes(forbidden)) {
      errors.push(`${relativeFile}: texto proibido encontrado: ${forbidden}`);
    }
  }

  const containerImages = [];
  const jobs = workflow.jobs ?? {};
  for (const job of Object.values(jobs)) {
    if (job && typeof job === 'object' && job.container) {
      const container = typeof job.container === 'string' ? job.container : job.container.image;
      if (container) {
        containerImages.push(container);
      }
    }
  }

  for (const image of containerImages) {
    if (/:latest($|@)/.test(image) || image.endsWith(':latest')) {
      errors.push(`${relativeFile}: container com tag latest proibida: ${image}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Falhas na validacao dos workflows:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Workflows validos: ${files.length} arquivo(s) verificado(s).`);
