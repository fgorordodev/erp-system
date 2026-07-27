export enum RefreshTokenRotationStatus {
  ROTATED = 'ROTATED',
  INVALID = 'INVALID',
  REUSE_DETECTED = 'REUSE_DETECTED',
}

export type RotatedRefreshToken = {
  status: RefreshTokenRotationStatus.ROTATED;
  sessionId: string;
  userId: string;
  newRefreshTokenId: string;
};

export type InvalidRefreshToken = {
  status: RefreshTokenRotationStatus.INVALID;
};

export type ReusedRefreshToken = {
  status: RefreshTokenRotationStatus.REUSE_DETECTED;
  sessionId: string;
  userId: string;
};

export type RefreshTokenRotationResult =
  RotatedRefreshToken | InvalidRefreshToken | ReusedRefreshToken;
