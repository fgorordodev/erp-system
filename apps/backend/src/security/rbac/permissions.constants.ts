export const PERMISSIONS = {
  USER_CREATE: {
    name: 'user:create',
    description: 'Create users',
  },
  USER_READ: {
    name: 'user:read',
    description: 'Read users',
  },
  USER_UPDATE: {
    name: 'user:update',
    description: 'Update users',
  },
  USER_DELETE: {
    name: 'user:delete',
    description: 'Delete users',
  },
} as const;
