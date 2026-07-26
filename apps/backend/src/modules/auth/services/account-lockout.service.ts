import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../../users/users.service';

@Injectable()
export class AccountLockoutService {
  constructor(
    private readonly usersService: UsersService,
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

    const now = new Date();

    const user = await this.usersService.incrementFailedLoginAttempts(
      userId,
      now,
    );

    if (user.failedLoginAttempts < maxFailedAttempts) {
      return;
    }

    await this.usersService.setLockedUntil(
      userId,
      new Date(now.getTime() + lockoutDurationMs),
    );
  }

  reset(userId: string): Promise<void> {
    return this.usersService.resetLoginFailures(userId);
  }
}
