export enum RefreshTokenRotationStatus {
  ROTATED = 'ROTATED',
  INVALID = 'INVALID',
  REUSE_DETECTED = 'REUSE_DETECTED',
}

export interface RotatedRefreshToken {
  status: RefreshTokenRotationStatus.ROTATED;
  sessionId: string;
  userId: string;
  newRefreshTokenId: string;
}

export interface InvalidRefreshToken {
  status: RefreshTokenRotationStatus.INVALID;
}

export interface ReusedRefreshToken {
  status: RefreshTokenRotationStatus.REUSE_DETECTED;
  sessionId: string;
  userId: string;
}

export type RefreshTokenRotationResult =
  RotatedRefreshToken | InvalidRefreshToken | ReusedRefreshToken;
