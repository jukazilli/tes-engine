import { existsSync, lstatSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const ignoredDirs = new Set(['node_modules', 'dist', 'coverage', '.nx', '.git']);
const errors = [];

function toPosix(value) {
  return value.replaceAll('\\', '/');
}

function walk(dir, output = []) {
  for (const entry of readdirSync(dir)) {
    const absolute = path.join(dir, entry);
    const relative = toPosix(path.relative(workspaceRoot, absolute));

    if (ignoredDirs.has(entry) || relative.startsWith('docs/execution/static/')) {
      continue;
    }

    const stats = statSync(absolute);
    if (stats.isDirectory()) {
      walk(absolute, output);
      continue;
    }

    if (entry.endsWith('.md')) {
      output.push(absolute);
    }
  }

  return output;
}

function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function anchorsFor(source) {
  const anchors = new Set();
  for (const line of source.split(/\r?\n/)) {
    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (match) {
      anchors.add(slugify(match[2]));
    }
  }
  return anchors;
}

function extractLinks(source) {
  const links = [];
  const pattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    links.push(match[1].trim());
  }
  return links;
}

function isExternal(link) {
  return /^(https?:|mailto:|tel:)/i.test(link);
}

function splitLink(link) {
  const [target, anchor] = link.split('#');
  return { target, anchor };
}

const markdownFiles = walk(workspaceRoot);
const markdownSet = new Set(
  markdownFiles.map((file) => toPosix(path.relative(workspaceRoot, file))),
);
const adrNumbers = new Map();

for (const file of markdownFiles) {
  const relative = toPosix(path.relative(workspaceRoot, file));
  const source = readFileSync(file, 'utf8');
  const lines = source.split(/\r?\n/);

  if (!lines.some((line) => /^#\s+\S/.test(line))) {
    errors.push(`${relative}: documento sem titulo H1.`);
  }

  if (/\bTODO\b(?!\s*\([^)]+\))/.test(source)) {
    errors.push(`${relative}: TODO sem identificacao.`);
  }

  if (/\bTBD\b/.test(source) && !relative.endsWith('open-domain-decisions.md')) {
    errors.push(`${relative}: TBD fora do registro de decisoes abertas.`);
  }

  if (/change-me/i.test(source)) {
    errors.push(`${relative}: placeholder change-me encontrado.`);
  }

  if (/```mermaid[\s\S]*?```/m.test(source) && !/```mermaid[\s\S]+?```/m.test(source)) {
    errors.push(`${relative}: bloco Mermaid vazio ou invalido.`);
  }

  const adrMatch = /^docs\/adr\/ADR-(\d{3})-.+\.md$/.exec(relative);
  if (adrMatch) {
    const current = adrNumbers.get(adrMatch[1]) ?? [];
    current.push(relative);
    adrNumbers.set(adrMatch[1], current);
  }

  const currentAnchors = anchorsFor(source);
  for (const rawLink of extractLinks(source)) {
    const decodedLink = rawLink.replaceAll('%20', ' ');

    if (/^[A-Za-z]:\\/.test(decodedLink) || decodedLink.startsWith('file:')) {
      errors.push(`${relative}: link local absoluto proibido: ${rawLink}`);
      continue;
    }

    if (isExternal(decodedLink)) {
      continue;
    }

    const { target, anchor } = splitLink(decodedLink);

    if (!target && anchor) {
      if (!currentAnchors.has(slugify(anchor))) {
        errors.push(`${relative}: ancora interna inexistente: #${anchor}`);
      }
      continue;
    }

    const resolved = path.resolve(path.dirname(file), target);
    if (!resolved.startsWith(workspaceRoot)) {
      errors.push(`${relative}: link aponta para fora do workspace: ${rawLink}`);
      continue;
    }

    if (!existsSync(resolved)) {
      errors.push(`${relative}: link aponta para arquivo inexistente: ${rawLink}`);
      continue;
    }

    if (lstatSync(resolved).isFile() && target.endsWith('.md')) {
      const targetRelative = toPosix(path.relative(workspaceRoot, resolved));
      if (!markdownSet.has(targetRelative)) {
        errors.push(`${relative}: markdown linkado nao esta no conjunto validado: ${rawLink}`);
      }
    }

    if (anchor && target.endsWith('.md')) {
      const targetSource = readFileSync(resolved, 'utf8');
      const targetAnchors = anchorsFor(targetSource);
      if (!targetAnchors.has(slugify(anchor))) {
        errors.push(`${relative}: ancora inexistente em ${rawLink}`);
      }
    }
  }
}

for (const [number, files] of adrNumbers.entries()) {
  if (files.length > 1) {
    errors.push(`ADR duplicado ${number}: ${files.join(', ')}`);
  }
}

if (errors.length > 0) {
  console.error('Falhas na validacao documental:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Documentacao validada: ${markdownFiles.length} arquivo(s) Markdown verificado(s).`);
