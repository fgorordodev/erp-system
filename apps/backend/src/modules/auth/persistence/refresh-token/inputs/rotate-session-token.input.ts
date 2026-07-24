export interface RotateSessionTokenInput {
  sessionId: string;
  currentRefreshTokenHash: string;
  newRefreshTokenHash: string;
}
