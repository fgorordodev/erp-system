export interface CreateSessionWithRefreshTokenInput {
  userId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  refreshTokenHash: string;
}
