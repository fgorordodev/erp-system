import type { Prisma } from '@erp/database';
import { SESSION_AUTHORIZATION_SELECT, SESSION_SELECT } from './session.select';

export type SessionProjection = Prisma.SessionGetPayload<{
  select: typeof SESSION_SELECT;
}>;

export type SessionAuthorizationProjection = Prisma.SessionGetPayload<{
  select: typeof SESSION_AUTHORIZATION_SELECT;
}>;
