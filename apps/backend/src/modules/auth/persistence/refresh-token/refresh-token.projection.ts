import type { Prisma } from '@erp/database';

import {
  REFRESH_TOKEN_CREATED_SELECT,
  REFRESH_TOKEN_ROTATION_SELECT,
} from './refresh-token.select';

export type RefreshTokenCreatedProjection = Prisma.RefreshTokenGetPayload<{
  select: typeof REFRESH_TOKEN_CREATED_SELECT;
}>;

export type RefreshTokenRotationProjection = Prisma.RefreshTokenGetPayload<{
  select: typeof REFRESH_TOKEN_ROTATION_SELECT;
}>;
