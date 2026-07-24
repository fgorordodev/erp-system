import { Prisma } from '@erp/database';

export const REFRESH_TOKEN_ROTATION_SELECT =
  Prisma.validator<Prisma.RefreshTokenSelect>()({
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
  });
