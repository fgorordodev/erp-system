import { Injectable } from '@nestjs/common';

import { BusinessException } from '@backend/common';
import { AUTH_ERROR_MESSAGES } from '@backend/modules/auth/constants';
import { ErrorCode } from '@erp/api-contracts';
import { AccountLockoutService } from './account-lockout.service';
import { PasswordHasherService } from '@backend/crypto';
import { UserAuthProjection, UsersService } from '@backend/modules/users';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasherService: PasswordHasherService,
    private readonly accountLockoutService: AccountLockoutService,
  ) {}

  async validate(email: string, password: string): Promise<UserAuthProjection> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw this.invalidCredentialsException();
    }

    const isLocked = await this.accountLockoutService.isLocked(
      user.id,
      user.lockedUntil,
    );

    if (isLocked) {
      throw this.invalidCredentialsException();
    }

    const passwordMatches = await this.passwordHasherService.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      if (user.isActive) {
        await this.accountLockoutService.registerFailure(user.id);
      }

      throw this.invalidCredentialsException();
    }

    if (!user.isActive) {
      throw this.invalidCredentialsException();
    }

    if (
      user.failedLoginAttempts > 0 ||
      user.lockedUntil !== null ||
      user.lastFailedLoginAt !== null
    ) {
      await this.accountLockoutService.reset(user.id);
    }

    return user;
  }

  private invalidCredentialsException(): BusinessException {
    return new BusinessException(
      ErrorCode.INVALID_CREDENTIALS,
      AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      401,
    );
  }
}
