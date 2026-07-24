import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApplication } from '@backend/config';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  it('GET /api/health', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }: { body: unknown }) => {
        expect(body).toMatchObject({
          success: true,
          data: {
            status: 'ok',
            services: {
              database: 'up',
            },
          },
          path: '/api/health',
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
