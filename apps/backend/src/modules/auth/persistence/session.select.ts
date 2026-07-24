import { Prisma } from '@prisma/client';

export const SESSION_SELECT = {
  id: true,
  userId: true,
  refreshTokenHash: true,
  userAgent: true,
  ipAddress: true,
  expiresAt: true,
  lastUsedAt: true,
  revokedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SessionSelect;

export const SESSION_VALIDATION_SELECT = {
  id: true,
  userId: true,
  refreshTokenHash: true,
  expiresAt: true,
  revokedAt: true,
} satisfies Prisma.SessionSelect;
