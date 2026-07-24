import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';

export const SWAGGER_UI_PATH = 'docs';
export const SWAGGER_JSON_PATH = 'docs-json';

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('ERP System API')
    .setDescription(
      'REST API for authentication, user administration and future ERP business modules.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the access token returned by POST /api/auth/login.',
      },
      'access-token',
    )
    .addTag('Health', 'Public operational health endpoints.')
    .addTag('Auth', 'Authentication, token rotation and session lifecycle.')
    .addTag('Users', 'Protected user-administration operations.')
    .build();

  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
  });
}

export function configureSwagger(app: INestApplication): OpenAPIObject {
  const document = createSwaggerDocument(app);

  SwaggerModule.setup(SWAGGER_UI_PATH, app, document, {
    jsonDocumentUrl: SWAGGER_JSON_PATH,
    customSiteTitle: 'ERP System API',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  return document;
}
