import { Prisma } from '@prisma/client';
import { REFRESH_TOKEN_CREATED_SELECT } from './refresh-token-created.select';

export type RefreshTokenCreatedProjection = Prisma.RefreshTokenGetPayload<{
  select: typeof REFRESH_TOKEN_CREATED_SELECT;
}>;
