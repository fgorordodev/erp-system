import { Injectable } from '@nestjs/common';
import type { Prisma } from '@erp/database';

import { PrismaService } from '@backend/database';
import {
  SESSION_AUTHORIZATION_SELECT,
  SESSION_SELECT,
  SESSION_VALIDATION_SELECT,
  type CreateSessionInput,
  type CreateSessionWithRefreshTokenInput,
  type SessionAuthorizationProjection,
  type SessionProjection,
  type SessionValidationProjection,
} from '@backend/modules/auth/persistence';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateSessionInput): Promise<SessionProjection> {
    return this.prisma.session.create({
      data: {
        userId: input.userId,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
      },
      select: SESSION_SELECT,
    });
  }

  createWithRefreshToken(
    input: CreateSessionWithRefreshTokenInput,
  ): Promise<SessionProjection> {
    return this.prisma.$transaction(async (transaction) => {
      const session = await transaction.session.create({
        data: {
          userId: input.userId,
          expiresAt: input.expiresAt,
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
        },
        select: SESSION_SELECT,
      });

      await transaction.refreshToken.create({
        data: {
          sessionId: session.id,
          tokenHash: input.refreshTokenHash,
          expiresAt: input.expiresAt,
        },
      });

      return session;
    });
  }

  findById(sessionId: string): Promise<SessionProjection | null> {
    return this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      select: SESSION_SELECT,
    });
  }

  findForValidation(
    sessionId: string,
  ): Promise<SessionValidationProjection | null> {
    return this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      select: SESSION_VALIDATION_SELECT,
    });
  }

  findForAuthorization(
    sessionId: string,
    userId: string,
  ): Promise<SessionAuthorizationProjection | null> {
    return this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
        user: {
          isActive: true,
          deletedAt: null,
        },
      },
      select: SESSION_AUTHORIZATION_SELECT,
    });
  }

  async touch(sessionId: string): Promise<boolean> {
    const now = new Date();

    const result = await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        lastUsedAt: now,
      },
    });

    return result.count === 1;
  }

  async revokeById(sessionId: string): Promise<boolean> {
    const revokedAt = new Date();

    const [sessionResult] = await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: {
          id: sessionId,
          revokedAt: null,
        },
        data: {
          revokedAt,
        },
      }),

      this.prisma.refreshToken.updateMany({
        where: {
          sessionId,
          revokedAt: null,
        },
        data: {
          revokedAt,
        },
      }),
    ]);

    return sessionResult.count === 1;
  }

  revokeAllByUserId(userId: string): Promise<number> {
    return this.prisma.$transaction((transaction) =>
      this.revokeAllByUserIdWithTransaction(transaction, userId),
    );
  }

  async revokeAllByUserIdWithTransaction(
    transaction: Prisma.TransactionClient,
    userId: string,
    revokedAt = new Date(),
  ): Promise<number> {
    const sessionResult = await transaction.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });

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

    return sessionResult.count;
  }
}
