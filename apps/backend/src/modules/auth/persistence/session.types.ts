import { Prisma } from '@prisma/client';

import { SESSION_SELECT, SESSION_VALIDATION_SELECT } from './session.select';

export type SessionProjection = Prisma.SessionGetPayload<{
  select: typeof SESSION_SELECT;
}>;

export type SessionValidationProjection = Prisma.SessionGetPayload<{
  select: typeof SESSION_VALIDATION_SELECT;
}>;
