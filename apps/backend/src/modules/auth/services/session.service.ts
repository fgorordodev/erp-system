import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../database';
import {
  SESSION_AUTHORIZATION_SELECT,
  SESSION_SELECT,
  SESSION_VALIDATION_SELECT,
  SessionAuthorizationProjection,
  type CreateSessionInput,
  type SessionProjection,
  type SessionValidationProjection,
} from '../persistence/session';

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
    const result = await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        lastUsedAt: new Date(),
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

  async revokeAllByUserId(userId: string): Promise<number> {
    const revokedAt = new Date();

    return this.prisma.$transaction(async (transaction) => {
      const activeSessions = await transaction.session.findMany({
        where: {
          userId,
          revokedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (activeSessions.length === 0) {
        return 0;
      }

      const sessionIds = activeSessions.map((session) => session.id);

      const sessionResult = await transaction.session.updateMany({
        where: {
          id: {
            in: sessionIds,
          },
          revokedAt: null,
        },
        data: {
          revokedAt,
        },
      });

      await transaction.refreshToken.updateMany({
        where: {
          sessionId: {
            in: sessionIds,
          },
          revokedAt: null,
        },
        data: {
          revokedAt,
        },
      });

      return sessionResult.count;
    });
  }
}
