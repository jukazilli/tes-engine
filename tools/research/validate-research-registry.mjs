import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CLAIM_SCOPES,
  CONFLICT_STATUSES,
  DECISION_STATUSES,
  DOMAINS,
  EVIDENCE_KINDS,
  RECORD_STATUSES,
  SOURCE_AUTHORITY_LEVELS,
  SOURCE_KINDS,
  isIsoDate,
  isIsoTimestamp,
  isUrl,
  listYamlFiles,
  loadYamlRecord,
  normalizePath,
  requireArrayEnum,
  requireEnum,
  requireFields,
} from './research-utils.mjs';

const RECORD_TYPES = ['source', 'question', 'evidence', 'claim', 'conflict', 'decision'];

export async function validateResearchRoot(rootDir = process.cwd()) {
  const files = [
    ...(await listYamlFiles(path.join(rootDir, 'docs/research/registry'))),
    ...(await listYamlFiles(path.join(rootDir, 'docs/research/examples'))),
  ];

  return validateYamlFiles(files, rootDir);
}

export async function validateYamlFiles(files, rootDir = process.cwd()) {
  const errors = [];
  const records = {
    source: new Map(),
    question: new Map(),
    evidence: new Map(),
    claim: new Map(),
    conflict: new Map(),
    decision: new Map(),
  };

  for (const file of files) {
    try {
      const record = await loadYamlRecord(file);
      const type = record.recordType;
      const relative = normalizePath(path.relative(rootDir, file));

      if (!RECORD_TYPES.includes(type)) {
        errors.push(`${relative}: invalid or missing recordType`);
        continue;
      }

      requireFields(record, ['id', 'recordType'], errors, relative);
      if (record.id && records[type].has(record.id)) {
        errors.push(`${relative}: duplicate ${type} id ${record.id}`);
      }

      records[type].set(record.id, { ...record, __file: relative });
    } catch (error) {
      errors.push(`${normalizePath(path.relative(rootDir, file))}: ${error.message}`);
    }
  }

  for (const record of records.source.values()) {
    validateSource(record, errors);
  }
  for (const record of records.question.values()) {
    validateQuestion(record, records, errors);
  }
  for (const record of records.evidence.values()) {
    validateEvidence(record, records, errors);
  }
  for (const record of records.claim.values()) {
    validateClaim(record, records, errors);
  }
  for (const record of records.conflict.values()) {
    validateConflict(record, records, errors);
  }
  for (const record of records.decision.values()) {
    validateDecision(record, records, errors);
  }

  return { ok: errors.length === 0, errors, records };
}

function validateSource(record, errors) {
  const file = record.__file;
  requireFields(
    record,
    ['title', 'kind', 'authorityLevel', 'domains', 'publisher', 'accessedAt', 'status'],
    errors,
    file,
  );
  requireEnum(record, 'kind', SOURCE_KINDS, errors, file);
  requireEnum(record, 'authorityLevel', SOURCE_AUTHORITY_LEVELS, errors, file);
  requireEnum(record, 'status', RECORD_STATUSES, errors, file);
  requireArrayEnum(record, 'domains', DOMAINS, errors, file);

  if (!isIsoDate(record.accessedAt)) {
    errors.push(`${file}: accessedAt must be YYYY-MM-DD`);
  }
  if (!isUrl(record.url)) {
    errors.push(`${file}: url must be http(s)`);
  }
  if (record.effectiveFrom && !isIsoDate(record.effectiveFrom)) {
    errors.push(`${file}: effectiveFrom must be YYYY-MM-DD`);
  }
  if (record.effectiveUntil && !isIsoDate(record.effectiveUntil)) {
    errors.push(`${file}: effectiveUntil must be YYYY-MM-DD`);
  }
  if (
    record.effectiveFrom &&
    record.effectiveUntil &&
    record.effectiveFrom > record.effectiveUntil
  ) {
    errors.push(`${file}: effectiveFrom cannot be after effectiveUntil`);
  }

  if (record.url?.includes('sempreju.com.br/tabelas_protheus/tabelas/tabela_sf4.html')) {
    if (
      record.kind !== 'THIRD_PARTY_TECHNICAL_CATALOG' ||
      record.authorityLevel !== 'SECONDARY_TECHNICAL'
    ) {
      errors.push(
        `${file}: SempreJU SF4 must be THIRD_PARTY_TECHNICAL_CATALOG and SECONDARY_TECHNICAL`,
      );
    }
  }

  if (record.kind === 'SYNTHETIC_EVIDENCE' && record.authorityLevel === 'PRIMARY_NORMATIVE') {
    errors.push(`${file}: synthetic evidence cannot be primary normative`);
  }
}

function validateQuestion(record, records, errors) {
  const file = record.__file;
  requireFields(
    record,
    [
      'question',
      'domains',
      'askedBy',
      'askedAt',
      'status',
      'requiredAuthority',
      'acceptedSourceIds',
    ],
    errors,
    file,
  );
  requireEnum(record, 'status', RECORD_STATUSES, errors, file);
  requireArrayEnum(record, 'domains', DOMAINS, errors, file);
  if (!isIsoDate(record.askedAt)) {
    errors.push(`${file}: askedAt must be YYYY-MM-DD`);
  }
  for (const sourceId of record.acceptedSourceIds ?? []) {
    if (!records.source.has(sourceId)) {
      errors.push(`${file}: acceptedSourceIds references unknown source ${sourceId}`);
    }
  }
}

function validateEvidence(record, records, errors) {
  const file = record.__file;
  requireFields(
    record,
    ['sourceId', 'questionId', 'kind', 'locator', 'observedAt', 'summary', 'status'],
    errors,
    file,
  );
  requireEnum(record, 'kind', EVIDENCE_KINDS, errors, file);
  requireEnum(record, 'status', RECORD_STATUSES, errors, file);
  if (!records.source.has(record.sourceId)) {
    errors.push(`${file}: unknown sourceId ${record.sourceId}`);
  }
  if (!records.question.has(record.questionId)) {
    errors.push(`${file}: unknown questionId ${record.questionId}`);
  }
  if (!isIsoTimestamp(record.observedAt)) {
    errors.push(`${file}: observedAt must be ISO timestamp in UTC`);
  }
  if (record.kind === 'SYNTHETIC_XML') {
    const source = records.source.get(record.sourceId);
    if (source?.authorityLevel === 'PRIMARY_NORMATIVE') {
      errors.push(`${file}: synthetic XML evidence cannot be normative`);
    }
  }
}

function validateClaim(record, records, errors) {
  const file = record.__file;
  requireFields(
    record,
    ['statement', 'domains', 'scope', 'sourceIds', 'evidenceIds', 'status'],
    errors,
    file,
  );
  requireEnum(record, 'status', RECORD_STATUSES, errors, file);
  requireArrayEnum(record, 'domains', DOMAINS, errors, file);

  if (!record.scope || !CLAIM_SCOPES.includes(record.scope.kind)) {
    errors.push(`${file}: scope.kind is required and must be valid`);
  }
  if (record.scope?.kind === 'STATE' && (!record.scope.country || !record.scope.state)) {
    errors.push(`${file}: STATE scope requires country and state`);
  }
  if (record.scope?.kind === 'RELEASE' && !record.scope.release) {
    errors.push(`${file}: RELEASE scope requires release`);
  }
  if (record.scope?.kind === 'TENANT_ENVIRONMENT' && !record.scope.tenantEnvironmentId) {
    errors.push(`${file}: TENANT_ENVIRONMENT scope requires tenantEnvironmentId`);
  }
  if (record.effectiveFrom && !isIsoDate(record.effectiveFrom)) {
    errors.push(`${file}: effectiveFrom must be YYYY-MM-DD`);
  }
  if (record.effectiveUntil && !isIsoDate(record.effectiveUntil)) {
    errors.push(`${file}: effectiveUntil must be YYYY-MM-DD`);
  }
  if (
    record.effectiveFrom &&
    record.effectiveUntil &&
    record.effectiveFrom > record.effectiveUntil
  ) {
    errors.push(`${file}: effectiveFrom cannot be after effectiveUntil`);
  }

  for (const sourceId of record.sourceIds ?? []) {
    if (!records.source.has(sourceId)) {
      errors.push(`${file}: unknown sourceId ${sourceId}`);
    }
  }
  for (const evidenceId of record.evidenceIds ?? []) {
    if (!records.evidence.has(evidenceId)) {
      errors.push(`${file}: unknown evidenceId ${evidenceId}`);
    }
  }

  if (['VERIFIED', 'VERIFIED_WITH_LIMITATIONS'].includes(record.status)) {
    if (!record.reviewer || !record.reviewedAt) {
      errors.push(`${file}: verified claims require reviewer and reviewedAt`);
    }
    if (record.reviewedAt && !isIsoDate(record.reviewedAt)) {
      errors.push(`${file}: reviewedAt must be YYYY-MM-DD`);
    }
    if ((record.sourceIds ?? []).length === 0 || (record.evidenceIds ?? []).length === 0) {
      errors.push(`${file}: verified claims require source and evidence`);
    }
  }

  const sourceRecords = (record.sourceIds ?? [])
    .map((sourceId) => records.source.get(sourceId))
    .filter(Boolean);
  if (
    sourceRecords.some((source) => source.authorityLevel === 'SECONDARY_TECHNICAL') &&
    record.status === 'VERIFIED'
  ) {
    errors.push(`${file}: secondary-only technical claims must be VERIFIED_WITH_LIMITATIONS`);
  }
  if (
    sourceRecords.some((source) => source.kind === 'SYNTHETIC_EVIDENCE') &&
    !record.limitations?.length
  ) {
    errors.push(`${file}: synthetic evidence claims require limitations`);
  }
  if (
    record.scope?.kind === 'RELEASE' &&
    !record.limitations?.some((text) => text.includes('release'))
  ) {
    errors.push(`${file}: RELEASE claims require a release limitation note`);
  }
}

function validateConflict(record, records, errors) {
  const file = record.__file;
  requireFields(record, ['claimIds', 'summary', 'resolutionStatus', 'resolution'], errors, file);
  requireEnum(record, 'resolutionStatus', CONFLICT_STATUSES, errors, file);
  if (!Array.isArray(record.claimIds) || record.claimIds.length < 2) {
    errors.push(`${file}: conflicts require at least two claimIds`);
  }
  for (const claimId of record.claimIds ?? []) {
    if (!records.claim.has(claimId)) {
      errors.push(`${file}: unknown claimId ${claimId}`);
    }
  }
}

function validateDecision(record, records, errors) {
  const file = record.__file;
  requireFields(
    record,
    ['title', 'status', 'decidedBy', 'decidedAt', 'acceptedClaimIds', 'consequences'],
    errors,
    file,
  );
  requireEnum(record, 'status', DECISION_STATUSES, errors, file);
  if (!isIsoDate(record.decidedAt)) {
    errors.push(`${file}: decidedAt must be YYYY-MM-DD`);
  }
  for (const claimId of record.acceptedClaimIds ?? []) {
    if (!records.claim.has(claimId)) {
      errors.push(`${file}: acceptedClaimIds references unknown claim ${claimId}`);
    }
  }
  for (const conflictId of record.conflictIds ?? []) {
    if (!records.conflict.has(conflictId)) {
      errors.push(`${file}: conflictIds references unknown conflict ${conflictId}`);
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await validateResearchRoot(process.cwd());
  if (!result.ok) {
    console.error(result.errors.join('\n'));
    process.exit(1);
  }
  console.log(
    `Research registry validation passed (${Object.values(result.records).reduce((total, map) => total + map.size, 0)} records).`,
  );
}
