import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import {
  configureApplication,
  configureSwagger,
  SWAGGER_UI_PATH,
} from '@backend/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const port = configService.getOrThrow<number>('BACKEND_PORT');

  configureApplication(app);
  configureSwagger(app);

  await app.listen(port);

  logger.log(`ERP API running at http://localhost:${port}/api`);
  logger.log(
    `Swagger available at http://localhost:${port}/${SWAGGER_UI_PATH}`,
  );
}

void bootstrap();
