import { ROLES } from './roles.constants';
import { PERMISSIONS } from './permissions.constants';

export const ROLE_DEFINITIONS = {
  [ROLES.ADMIN]: {
    description: 'Administrator with full access',

    permissions: [...Object.values(PERMISSIONS)],

    isSystem: true,
  },

  [ROLES.MANAGER]: {
    description: 'Manager user',

    permissions: [
      PERMISSIONS.USER_READ,

      PERMISSIONS.USER_CREATE,

      PERMISSIONS.USER_UPDATE,
    ],

    isSystem: true,
  },

  [ROLES.EMPLOYEE]: {
    description: 'Default employee role',

    permissions: [PERMISSIONS.USER_READ],

    isSystem: true,
  },
} as const;
