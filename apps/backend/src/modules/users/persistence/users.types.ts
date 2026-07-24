import { Prisma } from '@prisma/client';

import { USER_AUTH_SELECT, USER_RESPONSE_SELECT } from './users.select';

export type UserResponseProjection = Prisma.UserGetPayload<{
  select: typeof USER_RESPONSE_SELECT;
}>;

export type UserAuthProjection = Prisma.UserGetPayload<{
  select: typeof USER_AUTH_SELECT;
}>;
