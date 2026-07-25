import type { Prisma } from '@erp/database';

export const REFRESH_TOKEN_CREATED_SELECT = {
  id: true,
} satisfies Prisma.RefreshTokenSelect;
