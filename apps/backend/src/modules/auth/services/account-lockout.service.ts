import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@backend/database';

@Injectable()
export class AccountLockoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async isLocked(userId: string, lockedUntil: Date | null): Promise<boolean> {
    if (!lockedUntil) {
      return false;
    }

    if (lockedUntil.getTime() > Date.now()) {
      return true;
    }

    await this.reset(userId);

    return false;
  }

  async registerFailure(userId: string): Promise<void> {
    const maxFailedAttempts = this.configService.getOrThrow<number>(
      'AUTH_MAX_FAILED_ATTEMPTS',
    );

    const lockoutDurationMs = this.configService.getOrThrow<number>(
      'AUTH_LOCKOUT_DURATION_MS',
    );

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
        lastFailedLoginAt: new Date(),
      },
      select: {
        failedLoginAttempts: true,
      },
    });

    if (user.failedLoginAttempts < maxFailedAttempts) {
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + lockoutDurationMs),
      },
    });
  }

  async reset(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
      },
    });
  }
}
