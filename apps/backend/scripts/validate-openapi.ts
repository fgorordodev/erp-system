import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

interface Operation {
  summary?: string;
  tags?: string[];
  responses?: Record<string, unknown>;
  security?: Array<Record<string, string[]>>;
}

interface OpenApiDocument {
  openapi?: string;
  paths?: Record<string, Record<string, Operation>>;
}

const documentPath = resolve(__dirname, '../openapi/openapi.json');
const HTTP_METHODS = new Set([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head',
]);

async function validate(): Promise<void> {
  const document = JSON.parse(
    await readFile(documentPath, 'utf8'),
  ) as OpenApiDocument;
  const errors: string[] = [];

  if (!document.openapi?.startsWith('3.')) {
    errors.push('The document must use OpenAPI 3.x.');
  }

  const paths = document.paths ?? {};

  if (Object.keys(paths).length === 0) {
    errors.push('The document contains no API paths.');
  }

  const operationIds = new Set<string>();

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method)) continue;

      const label = `${method.toUpperCase()} ${path}`;
      const operationId = (operation as Operation & { operationId?: string })
        .operationId;

      if (!operation.summary) errors.push(`${label} has no summary.`);
      if (!operation.tags?.length) errors.push(`${label} has no tag.`);
      if (
        !operation.responses ||
        Object.keys(operation.responses).length === 0
      ) {
        errors.push(`${label} has no documented response.`);
      }
      if (!operationId) {
        errors.push(`${label} has no operationId.`);
      } else if (operationIds.has(operationId)) {
        errors.push(`${label} duplicates operationId ${operationId}.`);
      } else {
        operationIds.add(operationId);
      }

      const normalizedPath = path.replace(/^\/api/, '');
      const isPublic =
        normalizedPath === '/health' ||
        normalizedPath === '/auth/login' ||
        normalizedPath === '/auth/refresh';
      if (
        !isPublic &&
        !operation.security?.some((entry) => 'access-token' in entry)
      ) {
        errors.push(`${label} does not declare access-token security.`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('OpenAPI validation failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`OpenAPI validation passed (${operationIds.size} operations).`);
}

void validate();
