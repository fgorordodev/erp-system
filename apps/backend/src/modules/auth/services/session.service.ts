import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../database';
import { CreateSessionInput } from '../interfaces';
import {
  SESSION_SELECT,
  SESSION_VALIDATION_SELECT,
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

  revoke(sessionId: string): Promise<SessionProjection> {
    return this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        revokedAt: new Date(),
      },
      select: SESSION_SELECT,
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
}
