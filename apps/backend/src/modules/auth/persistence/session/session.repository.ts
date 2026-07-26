import { Injectable } from '@nestjs/common';

import { PrismaService } from '@backend/database';

import { SESSION_AUTHORIZATION_SELECT, SESSION_SELECT } from './session.select';
import type {
  SessionAuthorizationProjection,
  SessionProjection,
} from './session.projection';
import { CreateSessionInput } from './inputs/create-session.input';
import { CreateSessionWithRefreshTokenInput } from './inputs/create-session-with-refresh-token.input';

@Injectable()
export class SessionRepository {
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
}
