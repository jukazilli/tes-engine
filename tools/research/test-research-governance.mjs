import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { validateYamlFiles } from './validate-research-registry.mjs';

async function writeFixture(root, relativePath, content) {
  const fullPath = path.join(root, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, 'utf8');
  return fullPath;
}

const baseSource = `
recordType: source
id: src-official
title: Official source
kind: OFFICIAL_SCHEMA
authorityLevel: PRIMARY_NORMATIVE
domains: [NFE]
url: https://example.com/schema
publisher: Official
accessedAt: 2026-06-26
status: VERIFIED
copyrightPolicy: SUMMARY_ONLY
`;

const baseQuestion = `
recordType: question
id: q-1
question: What is valid?
domains: [NFE]
askedBy: Codex
askedAt: 2026-06-26
status: VERIFIED
requiredAuthority: [PRIMARY_NORMATIVE]
acceptedSourceIds: [src-official]
`;

const baseEvidence = `
recordType: evidence
id: ev-1
sourceId: src-official
questionId: q-1
kind: OFFICIAL_SCHEMA
locator: example
observedAt: 2026-06-26T00:00:00Z
summary: Schema locator only.
status: VERIFIED
`;

const baseClaim = `
recordType: claim
id: claim-1
statement: Official schemas define XML structure.
domains: [NFE]
scope:
  kind: GLOBAL
sourceIds: [src-official]
evidenceIds: [ev-1]
status: VERIFIED
reviewer: Codex
reviewedAt: 2026-06-26
`;

const baseDecision = `
recordType: decision
id: decision-1
title: Use official schema
status: ACCEPTED
decidedBy: Codex
decidedAt: 2026-06-26
acceptedClaimIds: [claim-1]
consequences: [Use official schemas for normative XML structure.]
`;

async function validateFixture(extraFiles = []) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tes-research-'));
  try {
    const files = [
      await writeFixture(root, 'source.yaml', baseSource),
      await writeFixture(root, 'question.yaml', baseQuestion),
      await writeFixture(root, 'evidence.yaml', baseEvidence),
      await writeFixture(root, 'claim.yaml', baseClaim),
      await writeFixture(root, 'decision.yaml', baseDecision),
    ];
    for (const [name, content] of extraFiles) {
      files.push(await writeFixture(root, name, content));
    }
    return await validateYamlFiles(files, root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

const valid = await validateFixture();
assert.equal(valid.ok, true, valid.errors.join('\n'));

const cases = [
  ['duplicate id', [['duplicate.yaml', baseSource]], /duplicate source id/],
  ['malformed yaml', [['bad.yaml', 'recordType: [']], /Flow sequence/],
  [
    'unknown record type',
    [['bad.yaml', 'recordType: nope\nid: nope']],
    /invalid or missing recordType/,
  ],
  [
    'invalid enum',
    [['bad.yaml', baseSource.replace('PRIMARY_NORMATIVE', 'PRIMARY')]],
    /invalid authorityLevel/,
  ],
  ['bad date', [['bad.yaml', baseSource.replace('2026-06-26', '26-06-2026')]], /accessedAt/],
  [
    'bad url',
    [['bad.yaml', baseSource.replace('https://example.com/schema', 'ftp://example.com')]],
    /url must be/,
  ],
  [
    'unknown source reference',
    [['bad.yaml', baseQuestion.replace('src-official', 'missing')]],
    /unknown source/,
  ],
  [
    'unknown evidence question',
    [['bad.yaml', baseEvidence.replace('q-1', 'missing')]],
    /unknown questionId/,
  ],
  [
    'verified missing reviewer',
    [['bad.yaml', baseClaim.replace('reviewer: Codex\nreviewedAt: 2026-06-26\n', '')]],
    /verified claims require/,
  ],
  [
    'state missing uf',
    [['bad.yaml', baseClaim.replace('kind: GLOBAL', 'kind: STATE\n  country: BR')]],
    /STATE scope/,
  ],
  [
    'release missing note',
    [['bad.yaml', baseClaim.replace('kind: GLOBAL', 'kind: RELEASE\n  release: 12.1.2410')]],
    /release limitation/,
  ],
  [
    'secondary verified',
    [
      [
        'secondary.yaml',
        baseSource
          .replace('id: src-official', 'id: src-secondary')
          .replace('OFFICIAL_SCHEMA', 'THIRD_PARTY_TECHNICAL_CATALOG')
          .replace('PRIMARY_NORMATIVE', 'SECONDARY_TECHNICAL'),
      ],
      ['bad.yaml', baseClaim.replace('src-official', 'src-secondary')],
    ],
    /secondary-only/,
  ],
  [
    'sempreju classification',
    [
      [
        'sempreju.yaml',
        baseSource
          .replace('id: src-official', 'id: src-sempreju')
          .replace(
            'https://example.com/schema',
            'https://sempreju.com.br/tabelas_protheus/tabelas/tabela_sf4.html',
          )
          .replace('OFFICIAL_SCHEMA', 'OFFICIAL_VENDOR_DOCUMENTATION'),
      ],
    ],
    /SempreJU SF4/,
  ],
  [
    'bad evidence timestamp',
    [['bad.yaml', baseEvidence.replace('2026-06-26T00:00:00Z', '2026-06-26')]],
    /observedAt/,
  ],
  [
    'unknown claim source',
    [['bad.yaml', baseClaim.replace('src-official', 'missing')]],
    /unknown sourceId/,
  ],
  [
    'unknown claim evidence',
    [['bad.yaml', baseClaim.replace('ev-1', 'missing')]],
    /unknown evidenceId/,
  ],
  [
    'conflict one claim',
    [
      [
        'bad.yaml',
        'recordType: conflict\nid: c\nclaimIds: [claim-1]\nsummary: x\nresolutionStatus: OPEN\nresolution: x',
      ],
    ],
    /at least two/,
  ],
  [
    'conflict unknown claim',
    [
      [
        'bad.yaml',
        'recordType: conflict\nid: c\nclaimIds: [claim-1, missing]\nsummary: x\nresolutionStatus: OPEN\nresolution: x',
      ],
    ],
    /unknown claimId/,
  ],
  [
    'decision unknown claim',
    [['bad.yaml', baseDecision.replace('claim-1', 'missing')]],
    /unknown claim/,
  ],
  [
    'effective date order',
    [
      [
        'bad.yaml',
        baseClaim.replace(
          'status: VERIFIED',
          'status: VERIFIED\neffectiveFrom: 2026-12-01\neffectiveUntil: 2026-01-01',
        ),
      ],
    ],
    /effectiveFrom cannot/,
  ],
  [
    'synthetic normative source',
    [['bad.yaml', baseSource.replace('OFFICIAL_SCHEMA', 'SYNTHETIC_EVIDENCE')]],
    /synthetic evidence cannot be primary normative/,
  ],
];

for (const [name, files, expected] of cases) {
  const result = await validateFixture(files);
  assert.equal(result.ok, false, `${name} should fail`);
  assert.match(result.errors.join('\n'), expected, name);
}

console.log(`Research governance tests passed (${cases.length + 1} cases).`);
