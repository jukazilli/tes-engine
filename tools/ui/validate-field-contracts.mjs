import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const matrixPath = path.join(workspaceRoot, 'docs', 'ui', 'master-data-field-matrix.md');

const controlledFields = new Set([
  'taxRegimeCode',
  'nfeCrtCode',
  'icmsTaxpayerIndicator',
  'establishmentType',
  'environmentType',
  'stateCode',
  'countryCode',
  'status',
  'mode',
  'taxDomainCode',
  'ownerCode',
  'sourceType',
  'validFrom',
  'validUntil',
]);

if (!existsSync(matrixPath)) {
  console.error('Missing docs/ui/master-data-field-matrix.md');
  process.exit(1);
}

const content = readFileSync(matrixPath, 'utf8');
const rows = content
  .split(/\r?\n/)
  .filter((line) => line.startsWith('|') && !line.includes('---'))
  .map((line) => line.split('|').map((cell) => cell.trim()));

const errors = [];
const registeredFields = new Set();
for (const row of rows) {
  const technicalCode = row[3];
  const controlType = row[5];
  if (technicalCode && technicalCode !== 'Codigo tecnico') {
    registeredFields.add(technicalCode);
  }
  if (controlledFields.has(technicalCode) && controlType === 'INPUT') {
    errors.push(`${technicalCode} is controlled and cannot use INPUT`);
  }
}

for (const field of controlledFields) {
  if (!registeredFields.has(field)) {
    errors.push(`${field} is missing from the field matrix`);
  }
}

if (errors.length > 0) {
  console.error('Invalid controlled field contracts:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('UI field contracts validated.');
