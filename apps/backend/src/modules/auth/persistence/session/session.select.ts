import { Prisma } from '@prisma/client';

export const SESSION_SELECT = {
  id: true,
  userId: true,
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
  expiresAt: true,
  revokedAt: true,

  user: {
    select: {
      isActive: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.SessionSelect;

export const SESSION_AUTHORIZATION_SELECT = {
  id: true,
  userId: true,
  expiresAt: true,
  revokedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      isActive: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.SessionSelect;
