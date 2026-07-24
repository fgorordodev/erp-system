import { Injectable } from '@nestjs/common';

import { BusinessException, ErrorCode } from '@backend/common';
import { HashService } from '@backend/security/crypto';
import { UserAuthProjection, UsersService } from '@backend/modules/users';
import { AUTH_ERROR_MESSAGES } from '@backend/modules/auth/constants';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
  ) {}

  async validate(email: string, password: string): Promise<UserAuthProjection> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw this.invalidCredentialsException();
    }

    const passwordMatches = await this.hashService.compare(
      password,
      user.password,
    );

    if (!passwordMatches || !user.isActive) {
      throw this.invalidCredentialsException();
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
