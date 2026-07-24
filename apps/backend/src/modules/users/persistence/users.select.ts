import { Prisma } from '@prisma/client';

export const USER_RESPONSE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  role: {
    select: {
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const USER_AUTH_SELECT = {
  id: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      id: true,
      name: true,
      permissions: {
        select: {
          permission: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.UserSelect;
