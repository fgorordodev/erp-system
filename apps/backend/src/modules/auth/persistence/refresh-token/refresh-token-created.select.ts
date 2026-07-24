import { Prisma } from '@prisma/client';

export const REFRESH_TOKEN_CREATED_SELECT =
  Prisma.validator<Prisma.RefreshTokenSelect>()({
    id: true,
  });
