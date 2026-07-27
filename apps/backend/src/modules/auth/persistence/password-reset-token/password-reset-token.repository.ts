import { Injectable } from '@nestjs/common';

import { PrismaService } from '@backend/database';
import type { Prisma } from '@erp/database';
import { CreatePasswordResetTokenInput } from './inputs/create-password-reset-token.input';

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

  async create(input: CreatePasswordResetTokenInput): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
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
}
