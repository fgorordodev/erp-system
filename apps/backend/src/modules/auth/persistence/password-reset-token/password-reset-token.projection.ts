import { Prisma } from '@erp/database';

import { PASSWORD_RESET_TOKEN_SELECT } from './password-reset-token.select';

export type PasswordResetTokenProjection = Prisma.PasswordResetTokenGetPayload<{
  select: typeof PASSWORD_RESET_TOKEN_SELECT;
}>;
