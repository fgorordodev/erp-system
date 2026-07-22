import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  BACKEND_PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error(
      'Invalid environment variables:',
      result.error.flatten().fieldErrors,
    );

    throw new Error('Environment validation failed');
  }

  return result.data;
}
