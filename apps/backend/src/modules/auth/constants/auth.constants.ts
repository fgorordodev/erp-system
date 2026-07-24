export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
  SESSION_NOT_FOUND: 'Session not found',
  SESSION_REVOKED: 'Session has been revoked',
  USER_INACTIVE: 'User account is inactive',
  CURRENT_PASSWORD_INVALID: 'Current password is invalid',
  PASSWORDS_MUST_DIFFER:
    'New password must be different from the current password',
} as const;

export const AUTH_SESSION_DURATION = {
  DEFAULT_DAYS: 7,
  REMEMBER_ME_DAYS: 30,
} as const;

export const AUTH_TOKEN_CONFIG = {
  REFRESH_TOKEN_BYTES: 64,
} as const;
