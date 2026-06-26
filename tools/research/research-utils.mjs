import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

export const SOURCE_AUTHORITY_LEVELS = [
  'PRIMARY_NORMATIVE',
  'PRIMARY_VENDOR',
  'ENVIRONMENT_SNAPSHOT',
  'INTERNAL_DECISION',
  'SECONDARY_TECHNICAL',
  'COMMUNITY_REFERENCE',
];

export const SOURCE_KINDS = [
  'OFFICIAL_LEGISLATION',
  'OFFICIAL_SCHEMA',
  'OFFICIAL_VENDOR_DOCUMENTATION',
  'VENDOR_KNOWLEDGE_BASE',
  'PROJECT_ARCHITECTURE',
  'THIRD_PARTY_TECHNICAL_CATALOG',
  'SYNTHETIC_EVIDENCE',
];

export const DOMAINS = [
  'PROTHEUS_MILE',
  'PROTHEUS_SX3',
  'PROTHEUS_SF4',
  'CONFIGTRIB',
  'NFE',
  'RESEARCH_GOVERNANCE',
];

export const RECORD_STATUSES = [
  'DRAFT',
  'UNDER_REVIEW',
  'VERIFIED',
  'VERIFIED_WITH_LIMITATIONS',
  'REJECTED',
  'SUPERSEDED',
  'OBSOLETE',
];

export const EVIDENCE_KINDS = [
  'OFFICIAL_PAGE',
  'OFFICIAL_SCHEMA',
  'OFFICIAL_DOCUMENT',
  'INTERNAL_DOCUMENT',
  'TECHNICAL_CATALOG_LOCATOR',
  'SYNTHETIC_XML',
  'MANUAL_OBSERVATION',
];

export const CLAIM_SCOPES = ['GLOBAL', 'COUNTRY', 'STATE', 'RELEASE', 'TENANT_ENVIRONMENT'];
export const CONFLICT_STATUSES = [
  'OPEN',
  'ACCEPTED_LIMITATION',
  'RESOLVED_BY_AUTHORITY',
  'RESOLVED_BY_ENVIRONMENT',
  'DEFERRED',
];
export const DECISION_STATUSES = ['PROPOSED', 'ACCEPTED', 'REJECTED', 'SUPERSEDED'];

export async function listYamlFiles(rootDir) {
  const results = [];

  async function walk(dir) {
    let entries = [];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
        results.push(entryPath);
      }
    }
  }

  await walk(rootDir);
  return results.sort();
}

export async function loadYamlRecord(filePath) {
  const raw = await readFile(filePath, 'utf8');
  const data = YAML.parse(raw);

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('YAML root must be an object');
  }

  return data;
}

export function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isIsoTimestamp(value) {
  return (
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  );
}

export function isUrl(value) {
  if (value === undefined) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function requireFields(record, fields, errors, filePath) {
  for (const field of fields) {
    if (record[field] === undefined || record[field] === null || record[field] === '') {
      errors.push(`${filePath}: missing required field ${field}`);
    }
  }
}

export function requireEnum(record, field, allowed, errors, filePath) {
  if (record[field] !== undefined && !allowed.includes(record[field])) {
    errors.push(`${filePath}: invalid ${field} ${record[field]}`);
  }
}

export function requireArrayEnum(record, field, allowed, errors, filePath) {
  if (!Array.isArray(record[field]) || record[field].length === 0) {
    errors.push(`${filePath}: ${field} must be a non-empty array`);
    return;
  }

  for (const value of record[field]) {
    if (!allowed.includes(value)) {
      errors.push(`${filePath}: invalid ${field} value ${value}`);
    }
  }
}

export function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/');
}
