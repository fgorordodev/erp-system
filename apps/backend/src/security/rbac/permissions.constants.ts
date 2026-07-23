export const PERMISSIONS = {
  USER_CREATE: {
    name: 'USER_CREATE',
    description: 'Create system users',
  },

  USER_READ: {
    name: 'USER_READ',
    description: 'View system users',
  },

  USER_UPDATE: {
    name: 'USER_UPDATE',
    description: 'Update system users',
  },

  USER_DELETE: {
    name: 'USER_DELETE',
    description: 'Delete system users',
  },

  ROLE_MANAGE: {
    name: 'ROLE_MANAGE',
    description: 'Manage roles and permissions',
  },
} as const;
