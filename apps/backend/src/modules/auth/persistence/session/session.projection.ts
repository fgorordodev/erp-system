import { Prisma } from '@prisma/client';
import {
  SESSION_AUTHORIZATION_SELECT,
  SESSION_SELECT,
  SESSION_VALIDATION_SELECT,
} from './session.select';

export type SessionProjection = Prisma.SessionGetPayload<{
  select: typeof SESSION_SELECT;
}>;

export type SessionValidationProjection = Prisma.SessionGetPayload<{
  select: typeof SESSION_VALIDATION_SELECT;
}>;

export type SessionAuthorizationProjection = Prisma.SessionGetPayload<{
  select: typeof SESSION_AUTHORIZATION_SELECT;
}>;
