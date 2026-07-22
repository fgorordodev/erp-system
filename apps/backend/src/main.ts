import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import {
  HttpExceptionFilter,
  LoggingInterceptor,
  PrismaExceptionFilter,
  ResponseInterceptor,
} from './common';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import helmet from 'helmet';
import { swaggerConfig } from './config';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');
logger.log('ERP API starting...');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [configService.getOrThrow<string>('FRONTEND_URL')],
    credentials: true,
  });

  app.use(helmet());

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfigSettings = swaggerConfig();

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfigSettings,
  );

  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = configService.getOrThrow<number>('BACKEND_PORT');

  await app.listen(port);
  logger.log(`API running on port: ${port}`);
}

void bootstrap();
