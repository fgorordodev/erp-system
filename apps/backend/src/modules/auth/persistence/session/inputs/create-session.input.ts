export interface CreateSessionInput {
  userId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}
