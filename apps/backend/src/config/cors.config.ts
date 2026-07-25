import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

const CORS_PREFLIGHT_MAX_AGE_SECONDS = 600;

export function createCorsOptions(configService: ConfigService): CorsOptions {
  const allowedOrigins = configService.getOrThrow<string[]>(
    'CORS_ALLOWED_ORIGINS',
  );

  return {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: CORS_PREFLIGHT_MAX_AGE_SECONDS,
  };
}
