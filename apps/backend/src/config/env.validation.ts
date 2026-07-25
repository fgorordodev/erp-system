import { Logger } from '@nestjs/common';
import { z } from 'zod';

const logger = new Logger('Env');

const HEX_64_PATTERN = /^[a-fA-F0-9]{64}$/;
const HEX_128_PATTERN = /^[a-fA-F0-9]{128}$/;
const DURATION_PATTERN = /^\d+(ms|s|m|h|d)$/;
const BODY_LIMIT_PATTERN = /^\d+(kb|mb)$/i;

const booleanFromEnvironment = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  return value;
}, z.boolean());

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

    BACKEND_PORT: z.coerce
      .number()
      .int('BACKEND_PORT must be an integer')
      .min(1, 'BACKEND_PORT must be greater than 0')
      .max(65_535, 'BACKEND_PORT must be lower than or equal to 65535')
      .default(3000),

    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required')
      .refine(
        (value) =>
          value.startsWith('postgresql://') || value.startsWith('postgres://'),
        {
          message: 'DATABASE_URL must be a PostgreSQL connection URL',
        },
      ),

    CORS_ALLOWED_ORIGINS: z
      .string()
      .min(1, 'CORS_ALLOWED_ORIGINS is required')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .pipe(
        z
          .array(z.url('Every CORS origin must be a valid absolute URL'))
          .min(1, 'At least one CORS origin is required'),
      ),

    JWT_ACCESS_SECRET: z
      .string()
      .regex(
        HEX_128_PATTERN,
        'JWT_ACCESS_SECRET must contain exactly 128 hexadecimal characters',
      ),

    JWT_REFRESH_SECRET: z
      .string()
      .regex(
        HEX_128_PATTERN,
        'JWT_REFRESH_SECRET must contain exactly 128 hexadecimal characters',
      ),

    JWT_ACCESS_EXPIRES: z
      .string()
      .regex(
        DURATION_PATTERN,
        'JWT_ACCESS_EXPIRES must use a duration such as 15m, 1h or 7d',
      )
      .default('15m'),

    JWT_REFRESH_EXPIRES: z
      .string()
      .regex(
        DURATION_PATTERN,
        'JWT_REFRESH_EXPIRES must use a duration such as 15m, 1h or 7d',
      )
      .default('7d'),

    ENCRYPTION_KEY: z
      .string()
      .regex(
        HEX_64_PATTERN,
        'ENCRYPTION_KEY must contain exactly 64 hexadecimal characters',
      ),

    SWAGGER_ENABLED: booleanFromEnvironment.default(true),

    TRUST_PROXY: booleanFromEnvironment.default(false),

    REQUEST_BODY_LIMIT: z
      .string()
      .regex(
        BODY_LIMIT_PATTERN,
        'REQUEST_BODY_LIMIT must use a value such as 100kb or 1mb',
      )
      .default('100kb'),

    THROTTLE_TTL_MS: z.coerce
      .number()
      .int('THROTTLE_TTL_MS must be an integer')
      .min(1_000, 'THROTTLE_TTL_MS must be at least 1000 milliseconds')
      .default(60_000),

    THROTTLE_LIMIT: z.coerce
      .number()
      .int('THROTTLE_LIMIT must be an integer')
      .min(1, 'THROTTLE_LIMIT must be greater than 0')
      .default(100),

    THROTTLE_REFRESH_TTL_MS: z.coerce
      .number()
      .int('THROTTLE_REFRESH_TTL_MS must be an integer')
      .min(1_000, 'THROTTLE_REFRESH_TTL_MS must be at least 1000 milliseconds')
      .default(60_000),

    THROTTLE_REFRESH_LIMIT: z.coerce
      .number()
      .int('THROTTLE_REFRESH_LIMIT must be an integer')
      .min(1, 'THROTTLE_REFRESH_LIMIT must be greater than 0')
      .default(10),
  })
  .passthrough()
  .superRefine((config, context) => {
    if (config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'JWT_REFRESH_SECRET must be different from JWT_ACCESS_SECRET',
      });
    }

    if (
      config.NODE_ENV === 'production' &&
      config.CORS_ALLOWED_ORIGINS.some((origin) => {
        const hostname = new URL(origin).hostname;

        return hostname === 'localhost' || hostname === '127.0.0.1';
      })
    ) {
      context.addIssue({
        code: 'custom',
        path: ['CORS_ALLOWED_ORIGINS'],
        message:
          'CORS_ALLOWED_ORIGINS cannot contain localhost addresses in production',
      });
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    for (const issue of result.error.issues) {
      const variableName =
        issue.path.length > 0 ? issue.path.join('.') : 'environment';

      logger.error(`- ${variableName}: ${issue.message}`);
    }

    throw new Error('Environment validation failed');
  }

  return result.data;
}
