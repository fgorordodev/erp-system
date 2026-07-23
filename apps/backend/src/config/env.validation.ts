import { z } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('Env');

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  BACKEND_PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(64),
  JWT_REFRESH_SECRET: z.string().min(64),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().length(64),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      logger.error(`- ${issue.path.join('.')}: ${issue.message}`);
    });

    throw new Error('Environment validation failed');
  }

  return result.data;
}
