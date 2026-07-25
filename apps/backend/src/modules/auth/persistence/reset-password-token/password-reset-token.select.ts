import { Prisma } from '@erp/database';

export const PASSWORD_RESET_TOKEN_SELECT = {
  id: true,
  userId: true,
  tokenHash: true,
  expiresAt: true,
  usedAt: true,
  revokedAt: true,
  createdAt: true,
} satisfies Prisma.PasswordResetTokenSelect;
