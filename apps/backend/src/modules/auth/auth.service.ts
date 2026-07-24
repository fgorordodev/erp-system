import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

import { BusinessException, ErrorCode } from '../../common/exceptions';
import { HashService, JwtService, TokenService } from '../../security';
import { UserMapper } from '../users/mappers';
import { UserAuthProjection } from '../users/persistence';
import { UsersService } from '../users';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SESSION_DURATION,
  AUTH_TOKEN_CONFIG,
} from './constants';
import { LoginDto } from './dto';
import { LoginResponse, SessionMetadata } from './interfaces';
import { SessionService } from './services';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    dto: LoginDto,
    metadata: SessionMetadata,
  ): Promise<LoginResponse> {
    const user = await this.validateCredentials(dto);

    const refreshToken = this.tokenService.generate(
      AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
    );

    const refreshTokenHash = await this.hashService.hash(refreshToken);

    const session = await this.sessionService.create({
      userId: user.id,
      refreshTokenHash,
      expiresAt: this.getSessionExpiration(dto.rememberMe),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });

    const accessToken = await this.jwtService.generateAccessToken({
      sub: user.id,
      sessionId: session.id,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getAccessTokenExpiresInSeconds(),
      user: UserMapper.toResponse(user),
    };
  }

  private async validateCredentials(
    dto: LoginDto,
  ): Promise<UserAuthProjection> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw this.invalidCredentialsException();
    }

    const passwordMatches = await this.hashService.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatches || !user.isActive) {
      throw this.invalidCredentialsException();
    }

    return user;
  }

  private getSessionExpiration(rememberMe: boolean): Date {
    const durationDays = rememberMe
      ? AUTH_SESSION_DURATION.REMEMBER_ME_DAYS
      : AUTH_SESSION_DURATION.DEFAULT_DAYS;

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + durationDays);

    return expiresAt;
  }

  private getAccessTokenExpiresInSeconds(): number {
    const duration =
      this.configService.getOrThrow<StringValue>('JWT_ACCESS_EXPIRES');

    return Math.floor(ms(duration) / 1000);
  }

  private invalidCredentialsException(): BusinessException {
    return new BusinessException(
      ErrorCode.INVALID_CREDENTIALS,
      AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      401,
    );
  }
}
