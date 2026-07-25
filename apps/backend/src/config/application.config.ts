import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { createCorsOptions } from './cors.config';
import { createHelmetOptions } from './helmet.config';

export function configureApplication(app: NestExpressApplication): void {
  const configService = app.get(ConfigService);

  const requestBodyLimit =
    configService.getOrThrow<string>('REQUEST_BODY_LIMIT');

  const trustProxy = configService.getOrThrow<boolean>('TRUST_PROXY');

  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);

  app.setGlobalPrefix('api');

  app.use(helmet(createHelmetOptions(configService)));

  app.enableCors(createCorsOptions(configService));

  app.use(
    json({
      limit: requestBodyLimit,
    }),
  );

  app.use(
    urlencoded({
      limit: requestBodyLimit,
      extended: true,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
    }),
  );
}
