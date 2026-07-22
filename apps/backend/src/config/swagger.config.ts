import { DocumentBuilder } from '@nestjs/swagger';

export function swaggerConfig() {
  return new DocumentBuilder()
    .setTitle('ERP System API')
    .setDescription('Backend API for ERP System management platform')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addTag('Health')
    .build();
}
