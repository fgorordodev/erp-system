import { Prisma } from '@prisma/client';
import { REFRESH_TOKEN_ROTATION_SELECT } from './refresh-token-rotation.select';

export type RefreshTokenRotationProjection = Prisma.RefreshTokenGetPayload<{
  select: typeof REFRESH_TOKEN_ROTATION_SELECT;
}>;
