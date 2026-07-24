import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { NestFactory } from '@nestjs/core';

const backendRoot = resolve(__dirname, '..');
const outputPath = resolve(backendRoot, 'openapi/openapi.json');

process.env.NODE_ENV ??= 'test';
process.env.BACKEND_PORT ??= '3000';
process.env.FRONTEND_URL ??= 'http://localhost:5173';
process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@localhost:5432/erp_system';
process.env.JWT_ACCESS_SECRET ??= 'a'.repeat(64);
process.env.JWT_REFRESH_SECRET ??= 'b'.repeat(64);
process.env.JWT_ACCESS_EXPIRES ??= '15m';
process.env.JWT_REFRESH_EXPIRES ??= '7d';
process.env.ENCRYPTION_KEY ??= 'c'.repeat(64);

async function generate(): Promise<void> {
  const [{ AppModule }, { configureApplication, createSwaggerDocument }] =
    await Promise.all([
      import('../src/app.module'),
      import('../src/config'),
    ]);

  const app = await NestFactory.create(AppModule, { logger: false });

  try {
    configureApplication(app);
    const document = createSwaggerDocument(app);
    await mkdir(resolve(backendRoot, 'openapi'), { recursive: true });
    await writeFile(
      outputPath,
      `${JSON.stringify(document, null, 2)}\n`,
      'utf8',
    );
    console.log(`OpenAPI document generated at ${outputPath}`);
  } finally {
    await app.close();
  }
}

void generate();
