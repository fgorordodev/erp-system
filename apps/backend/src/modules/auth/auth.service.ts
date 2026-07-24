import { Injectable } from '@nestjs/common';

import { BusinessException, ErrorCode } from '../../common/exceptions';
import { HashService } from '../../security';
import { UsersService } from '../users';
import { LoginDto } from './dto';
import { AUTH_ERROR_MESSAGES } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateCredentials(dto);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      role: {
        name: user.role.name,
      },
    };
  }

  private async validateCredentials(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw this.invalidCredentialsException();
    }

    const passwordMatches = await this.hashService.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw this.invalidCredentialsException();
    }

    if (!user.isActive) {
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
