import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database';
import {
  RefreshTokenRotationResult,
  RefreshTokenRotationStatus,
} from '../interfaces';
import {
  CreateRefreshTokenInput,
  REFRESH_TOKEN_CREATED_SELECT,
  REFRESH_TOKEN_ROTATION_SELECT,
  RotateRefreshTokenInput,
} from '../persistence';
import { Prisma } from '@prisma/client';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  rotate(input: RotateRefreshTokenInput): Promise<RefreshTokenRotationResult> {
    return this.prisma.$transaction(async (transaction) => {
      const currentToken = await transaction.refreshToken.findUnique({
        where: {
          tokenHash: input.currentTokenHash,
        },
        select: REFRESH_TOKEN_ROTATION_SELECT,
      });

      if (!currentToken) {
        return {
          status: RefreshTokenRotationStatus.INVALID,
        };
      }

      const now = new Date();
      const { session } = currentToken;

      const invalidSession =
        session.revokedAt !== null ||
        session.expiresAt <= now ||
        !session.user.isActive ||
        session.user.deletedAt !== null;

      const invalidToken =
        currentToken.revokedAt !== null || currentToken.expiresAt <= now;

      if (invalidSession || invalidToken) {
        return {
          status: RefreshTokenRotationStatus.INVALID,
        };
      }

      if (currentToken.usedAt !== null) {
        await this.revokeFamily(transaction, session.id, now);

        return {
          status: RefreshTokenRotationStatus.REUSE_DETECTED,
          sessionId: session.id,
          userId: session.userId,
        };
      }

      const consumed = await transaction.refreshToken.updateMany({
        where: {
          id: currentToken.id,
          usedAt: null,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

      if (consumed.count !== 1) {
        await this.revokeFamily(transaction, session.id, now);

        return {
          status: RefreshTokenRotationStatus.REUSE_DETECTED,
          sessionId: session.id,
          userId: session.userId,
        };
      }

      const newRefreshToken = await transaction.refreshToken.create({
        data: {
          sessionId: session.id,
          tokenHash: input.newTokenHash,
          expiresAt: session.expiresAt,
        },
        select: REFRESH_TOKEN_CREATED_SELECT,
      });

      await transaction.refreshToken.update({
        where: {
          id: currentToken.id,
        },
        data: {
          replacedByTokenId: newRefreshToken.id,
        },
      });

      await transaction.session.update({
        where: {
          id: session.id,
        },
        data: {
          lastUsedAt: now,
        },
      });

      return {
        status: RefreshTokenRotationStatus.ROTATED,
        sessionId: session.id,
        userId: session.userId,
        newRefreshTokenId: newRefreshToken.id,
      };
    });
  }

  private async revokeFamily(
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

  async create(input: CreateRefreshTokenInput): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        sessionId: input.sessionId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
  }
}
