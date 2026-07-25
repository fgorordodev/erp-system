import { Injectable } from '@nestjs/common';

import { PrismaService } from '@backend/database';
import {
  type CreatePasswordResetTokenInput,
  PASSWORD_RESET_TOKEN_SELECT,
  type PasswordResetTokenProjection,
} from '@backend/modules/auth/persistence';

@Injectable()
export class PasswordResetTokenService {
  constructor(private readonly prisma: PrismaService) {}

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

  async revokeActiveByUserId(userId: string): Promise<number> {
    const result = await this.prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  async markAsUsed(tokenId: string): Promise<boolean> {
    const now = new Date();

    const result = await this.prisma.passwordResetToken.updateMany({
      where: {
        id: tokenId,
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

    return result.count === 1;
  }
}
