export interface CreateSessionWithRefreshTokenInput {
  userId: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
  refreshTokenHash: string;
}
