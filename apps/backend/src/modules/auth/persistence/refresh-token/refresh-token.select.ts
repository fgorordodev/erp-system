import type { Prisma } from '@erp/database';

export const REFRESH_TOKEN_CREATED_SELECT = {
  id: true,
} satisfies Prisma.RefreshTokenSelect;

export const REFRESH_TOKEN_ROTATION_SELECT = {
  id: true,
  sessionId: true,
  expiresAt: true,
  usedAt: true,
  revokedAt: true,
  session: {
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          isActive: true,
          deletedAt: true,
        },
      },
    },
  },
} satisfies Prisma.RefreshTokenSelect;
