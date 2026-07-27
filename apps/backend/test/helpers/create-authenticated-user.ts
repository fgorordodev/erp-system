import type { AuthenticatedUser } from '@backend/modules/auth/types/authenticated-user.type';

export const createAuthenticatedUser = (
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser => ({
  userId: 'user-id',
  sessionId: 'session-id',
  email: 'user@example.com',
  roles: [],
  permissions: [],
  ...overrides,
});
