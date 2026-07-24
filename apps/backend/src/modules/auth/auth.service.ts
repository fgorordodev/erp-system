import { Injectable } from '@nestjs/common';

import { BusinessException, ErrorCode } from '../../common/exceptions';
import { HashService } from '../../security';
import { UsersService } from '../users';
import { LoginDto } from './dto';
import { AUTH_ERROR_MESSAGES } from './constants';
import { UserMapper } from '../users/mappers';
import { UserResponseDto } from '../users/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
  ) {}

  async login(dto: LoginDto): Promise<UserResponseDto> {
    const user = await this.validateCredentials(dto);

    return UserMapper.toResponse(user);
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
