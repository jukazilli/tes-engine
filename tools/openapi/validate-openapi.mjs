import { spawn } from 'node:child_process';

const port = '3401';
const baseUrl = `http://127.0.0.1:${port}`;
const expectedPaths = ['/api/health', '/api/health/live', '/api/health/ready'];
const expectedSchemas = [
  'HealthResponseDto',
  'LivenessResponseDto',
  'ReadinessResponseDto',
  'ApiErrorResponseDto',
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url, retries = 40) {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await delay(500);
  }

  throw lastError;
}

function validateDocument(document) {
  const errors = [];

  if (!document.openapi || !String(document.openapi).startsWith('3.')) {
    errors.push('OpenAPI version 3.x was not found.');
  }

  for (const path of expectedPaths) {
    if (!document.paths?.[path]) {
      errors.push(`Missing OpenAPI path: ${path}`);
    }
  }

  for (const schema of expectedSchemas) {
    if (!document.components?.schemas?.[schema]) {
      errors.push(`Missing OpenAPI schema: ${schema}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

const child = spawn('node', ['dist/apps/api/main.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'test',
    API_PORT: port,
    API_PREFIX: 'api',
    LOG_LEVEL: 'silent',
    CORS_ORIGINS: 'http://localhost:4200,http://localhost:4300',
    APP_VERSION: '0.1.0',
    OPENAPI_ENABLED: 'true',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stderr = '';
child.stderr.on('data', (chunk) => {
  stderr += chunk.toString();
});

try {
  const document = await fetchJsonWithRetry(`${baseUrl}/api/docs-json`);
  validateDocument(document);
  console.log('OpenAPI validated: version, paths and schemas are present.');
} catch (error) {
  console.error('OpenAPI validation failed.');
  console.error(error instanceof Error ? error.message : String(error));
  if (stderr) {
    console.error(stderr);
  }
  process.exitCode = 1;
} finally {
  child.kill('SIGTERM');
}
