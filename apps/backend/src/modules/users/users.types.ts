import { Prisma } from '@prisma/client';

import { USER_AUTH_SELECT, USER_RESPONSE_SELECT } from './users.select';

export type UserResponseEntity = Prisma.UserGetPayload<{
  select: typeof USER_RESPONSE_SELECT;
}>;

export type UserAuthEntity = Prisma.UserGetPayload<{
  select: typeof USER_AUTH_SELECT;
}>;
