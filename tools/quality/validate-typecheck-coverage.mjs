import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const ignoredDirectories = new Set(['.git', '.nx', 'coverage', 'dist', 'node_modules']);
const errors = [];

function walk(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) {
      continue;
    }

    const fullPath = path.join(directory, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (entry === 'project.json') {
      files.push(fullPath);
    }
  }

  return files;
}

function toWorkspacePath(filePath) {
  return path.relative(workspaceRoot, filePath).replaceAll('\\', '/');
}

function readProject(projectFile) {
  const relativeFile = toWorkspacePath(projectFile);

  try {
    return JSON.parse(readFileSync(projectFile, 'utf8'));
  } catch (error) {
    errors.push(`${relativeFile}: project.json invalido: ${error.message}`);
    return null;
  }
}

function hasTypeScriptSource(project) {
  if (!project.sourceRoot) {
    return false;
  }

  const sourceRoot = path.join(workspaceRoot, project.sourceRoot);
  if (!existsSync(sourceRoot)) {
    return false;
  }

  const stack = [sourceRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current)) {
      const fullPath = path.join(current, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (/\.tsx?$/.test(entry)) {
        return true;
      }
    }
  }

  return false;
}

const projects = walk(workspaceRoot)
  .map((projectFile) => ({ projectFile, project: readProject(projectFile) }))
  .filter(({ project }) => project)
  .sort((a, b) => a.project.name.localeCompare(b.project.name));

const coveredProjects = [];
const skippedProjects = [];
const uncoveredProjects = [];

for (const { projectFile, project } of projects) {
  const relativeFile = toWorkspacePath(projectFile);
  const projectName = project.name ?? relativeFile;

  if (!hasTypeScriptSource(project)) {
    skippedProjects.push(`${projectName} (${relativeFile})`);
    continue;
  }

  if (project.targets?.typecheck) {
    coveredProjects.push(`${projectName} (${relativeFile})`);
    continue;
  }

  uncoveredProjects.push(`${projectName} (${relativeFile})`);
}

if (coveredProjects.length > 0) {
  console.log('Projetos cobertos por typecheck:');
  for (const project of coveredProjects) {
    console.log(`- ${project}`);
  }
}

if (skippedProjects.length > 0) {
  console.log('Projetos ignorados por nao possuirem codigo TypeScript:');
  for (const project of skippedProjects) {
    console.log(`- ${project}`);
  }
}

if (uncoveredProjects.length > 0) {
  errors.push('Projetos TypeScript sem target typecheck:');
  for (const project of uncoveredProjects) {
    errors.push(`- ${project}`);
  }
}

if (errors.length > 0) {
  console.error('Falhas na cobertura de typecheck:');
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(`Cobertura de typecheck validada: ${coveredProjects.length} projeto(s) coberto(s).`);
