import type { Prisma } from '@erp/database';

export const USER_RESPONSE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  roles: {
    select: {
      role: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      assignedAt: 'asc',
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
  roles: {
    select: {
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
    },
  },
} satisfies Prisma.UserSelect;
