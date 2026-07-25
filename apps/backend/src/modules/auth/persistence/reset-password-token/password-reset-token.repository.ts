import { Injectable } from '@nestjs/common';

import { PrismaService } from '@backend/database';
import type { Prisma } from '@erp/database';

import type { CreatePasswordResetTokenInput } from './inputs';
import type { PasswordResetTokenProjection } from './password-reset-token.projection';
import { PASSWORD_RESET_TOKEN_SELECT } from './password-reset-token.select';

type PasswordResetTokenIdentity = {
  id: string;
  userId: string;
};

@Injectable()
export class PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  withTransaction<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(operation);
  }

  create(
    input: CreatePasswordResetTokenInput,
  ): Promise<PasswordResetTokenProjection> {
    return this.prisma.passwordResetToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
      select: PASSWORD_RESET_TOKEN_SELECT,
    });
  }

  findValidByHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenProjection | null> {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
        user: {
          isActive: true,
          deletedAt: null,
        },
      },
      select: PASSWORD_RESET_TOKEN_SELECT,
    });
  }

  findValidByHashForUpdate(
    transaction: Prisma.TransactionClient,
    tokenHash: string,
    now: Date,
  ): Promise<PasswordResetTokenIdentity | null> {
    return transaction.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
        user: {
          isActive: true,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });
  }

  async revokeActiveByUserId(userId: string): Promise<number> {
    const now = new Date();

    const result = await this.prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        revokedAt: now,
      },
    });

    return result.count;
  }

  async consume(
    transaction: Prisma.TransactionClient,
    tokenId: string,
    usedAt: Date,
  ): Promise<boolean> {
    const result = await transaction.passwordResetToken.updateMany({
      where: {
        id: tokenId,
        usedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: usedAt,
        },
      },
      data: {
        usedAt,
      },
    });

    return result.count === 1;
  }

  async revokeOtherActiveTokens(
    transaction: Prisma.TransactionClient,
    userId: string,
    consumedTokenId: string,
    revokedAt: Date,
  ): Promise<void> {
    await transaction.passwordResetToken.updateMany({
      where: {
        userId,
        id: {
          not: consumedTokenId,
        },
        usedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });
  }

  async revokeAuthenticationSessions(
    transaction: Prisma.TransactionClient,
    userId: string,
    revokedAt: Date,
  ): Promise<void> {
    await transaction.refreshToken.updateMany({
      where: {
        session: {
          userId,
        },
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });

    await transaction.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });
  }

  async resetAccountLockout(
    transaction: Prisma.TransactionClient,
    userId: string,
  ): Promise<void> {
    await transaction.user.update({
      where: {
        id: userId,
      },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
      },
    });
  }
}
