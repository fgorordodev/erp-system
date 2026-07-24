import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../database';
import { CreateSessionInput, RotateSessionTokenInput } from '../interfaces';
import {
  SESSION_AUTHORIZATION_SELECT,
  SESSION_SELECT,
  SESSION_VALIDATION_SELECT,
  SessionAuthorizationProjection,
  SessionProjection,
  SessionValidationProjection,
} from '../persistence';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateSessionInput): Promise<SessionProjection> {
    return this.prisma.session.create({
      data: {
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
      },
      select: SESSION_SELECT,
    });
  }

  findById(sessionId: string): Promise<SessionValidationProjection | null> {
    return this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      select: SESSION_VALIDATION_SELECT,
    });
  }

  async revokeAllByUserId(userId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  touch(sessionId: string): Promise<SessionProjection> {
    return this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        lastUsedAt: new Date(),
      },
      select: SESSION_SELECT,
    });
  }

  findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<SessionValidationProjection | null> {
    return this.prisma.session.findUnique({
      where: {
        refreshTokenHash,
      },
      select: SESSION_VALIDATION_SELECT,
    });
  }

  async rotateRefreshToken(input: RotateSessionTokenInput): Promise<boolean> {
    const result = await this.prisma.session.updateMany({
      where: {
        id: input.sessionId,
        refreshTokenHash: input.currentRefreshTokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        refreshTokenHash: input.newRefreshTokenHash,
        lastUsedAt: new Date(),
      },
    });

    return result.count === 1;
  }

  async revokeById(sessionId: string): Promise<boolean> {
    const result = await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count === 1;
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
}
