import { z } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('Env');

const durationSchema = z
  .string()
  .regex(/^\d+(ms|s|m|h|d|w|y)$/, 'Expected a duration such as 15m, 7d or 1h');

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  BACKEND_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.url().refine(
    (url) => {
      const parsed = new URL(url);
      return (
        parsed.protocol === 'postgres:' || parsed.protocol === 'postgresql:'
      );
    },
    {
      message: 'DATABASE_URL must use postgres:// or postgresql://',
    },
  ),
  FRONTEND_URL: z.url().refine(
    (url) => {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    },
    {
      message: 'FRONTEND_URL must use http:// or https://',
    },
  ),
  JWT_ACCESS_SECRET: z.string().min(64),
  JWT_REFRESH_SECRET: z.string().min(64),
  JWT_ACCESS_EXPIRES: durationSchema.default('15m'),
  JWT_REFRESH_EXPIRES: durationSchema.default('7d'),
  ENCRYPTION_KEY: z
    .string()
    .length(64)
    .regex(
      /^[a-fA-F0-9]{64}$/,
      'ENCRYPTION_KEY must be a 64-character hexadecimal string',
    ),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      logger.error(`- ${issue.path.join('.')}: ${issue.message}`);
    });

    throw new Error('Environment validation failed');
  }

  return result.data;
}
