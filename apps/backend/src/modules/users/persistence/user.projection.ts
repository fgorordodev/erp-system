import type { Prisma } from '@erp/database';
import { USER_AUTH_SELECT, USER_RESPONSE_SELECT } from './user.select';

export type UserResponseProjection = Prisma.UserGetPayload<{
  select: typeof USER_RESPONSE_SELECT;
}>;

export type UserAuthProjection = Prisma.UserGetPayload<{
  select: typeof USER_AUTH_SELECT;
}>;
