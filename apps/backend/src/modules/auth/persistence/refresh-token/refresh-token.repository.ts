import { Injectable } from '@nestjs/common';

import { PrismaService } from '@backend/database';
import type { Prisma } from '@erp/database';

import { REFRESH_TOKEN_ROTATION_SELECT } from './refresh-token-rotation.select';
import { REFRESH_TOKEN_CREATED_SELECT } from './refresh-token-created.select';

type RefreshTokenRotationProjection = Prisma.RefreshTokenGetPayload<{
  select: typeof REFRESH_TOKEN_ROTATION_SELECT;
}>;

type RefreshTokenCreatedProjection = Prisma.RefreshTokenGetPayload<{
  select: typeof REFRESH_TOKEN_CREATED_SELECT;
}>;

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  withTransaction<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(operation);
  }

  findForRotation(
    transaction: Prisma.TransactionClient,
    tokenHash: string,
  ): Promise<RefreshTokenRotationProjection | null> {
    return transaction.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      select: REFRESH_TOKEN_ROTATION_SELECT,
    });
  }

  async consume(
    transaction: Prisma.TransactionClient,
    tokenId: string,
    usedAt: Date,
  ): Promise<boolean> {
    const result = await transaction.refreshToken.updateMany({
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

  createReplacement(
    transaction: Prisma.TransactionClient,
    input: {
      sessionId: string;
      tokenHash: string;
      expiresAt: Date;
    },
  ): Promise<RefreshTokenCreatedProjection> {
    return transaction.refreshToken.create({
      data: {
        sessionId: input.sessionId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
      select: REFRESH_TOKEN_CREATED_SELECT,
    });
  }

  async linkReplacement(
    transaction: Prisma.TransactionClient,
    currentTokenId: string,
    replacementTokenId: string,
  ): Promise<void> {
    await transaction.refreshToken.update({
      where: {
        id: currentTokenId,
      },
      data: {
        replacedByTokenId: replacementTokenId,
      },
    });
  }

  async touchSession(
    transaction: Prisma.TransactionClient,
    sessionId: string,
    lastUsedAt: Date,
  ): Promise<void> {
    await transaction.session.update({
      where: {
        id: sessionId,
      },
      data: {
        lastUsedAt,
      },
    });
  }

  async revokeFamily(
    transaction: Prisma.TransactionClient,
    sessionId: string,
    revokedAt: Date,
  ): Promise<void> {
    await transaction.session.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });

    await transaction.refreshToken.updateMany({
      where: {
        sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });
  }
}
