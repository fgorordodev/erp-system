import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import {
  configureApplication,
  configureSwagger,
  SWAGGER_UI_PATH,
} from '@backend/config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

const bootstrapLogger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('BACKEND_PORT');

  configureApplication(app);
  configureSwagger(app);

  await app.listen(port);

  bootstrapLogger.log(`ERP API running at http://localhost:${port}/api`);
  bootstrapLogger.log(
    `Swagger available at http://localhost:${port}/${SWAGGER_UI_PATH}`,
  );
}

void bootstrap().catch((error: unknown) => {
  bootstrapLogger.error(
    'Application failed to start',
    error instanceof Error ? error.stack : String(error),
  );

  process.exitCode = 1;
});
