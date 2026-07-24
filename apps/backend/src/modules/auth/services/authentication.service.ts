import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import type { StringValue } from 'ms';

import { JwtService, TokenService } from '../../../security';
import { UserMapper } from '../../users';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SESSION_DURATION,
  AUTH_TOKEN_CONFIG,
} from '../constants';
import { LoginDto, RefreshDto } from '../dto';
import { LoginResponse, SessionMetadata, TokenPair } from '../interfaces';
import { CredentialsService } from './credentials.service';
import { SessionService } from './session.service';
import { BusinessException, ErrorCode } from '../../../common';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    dto: LoginDto,
    metadata: SessionMetadata,
  ): Promise<LoginResponse> {
    const user = await this.credentialsService.validate(
      dto.email,
      dto.password,
    );

    const refreshToken = this.tokenService.generate(
      AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
    );

    const refreshTokenHash = this.tokenService.hash(refreshToken);

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
      expiresIn: this.getAccessTokenExpirationSeconds(),
      user: UserMapper.toResponse(user),
    };
  }

  private getSessionExpiration(rememberMe: boolean): Date {
    const durationDays = rememberMe
      ? AUTH_SESSION_DURATION.REMEMBER_ME_DAYS
      : AUTH_SESSION_DURATION.DEFAULT_DAYS;

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + durationDays);

    return expiresAt;
  }

  private getAccessTokenExpirationSeconds(): number {
    const duration =
      this.configService.getOrThrow<StringValue>('JWT_ACCESS_EXPIRES');

    return Math.floor(ms(duration) / 1000);
  }

  async refresh(dto: RefreshDto): Promise<TokenPair> {
    const currentRefreshTokenHash = this.tokenService.hash(dto.refreshToken);

    const session = await this.sessionService.findByRefreshTokenHash(
      currentRefreshTokenHash,
    );

    if (!session) {
      throw this.invalidRefreshTokenException();
    }

    if (
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.user.isActive ||
      session.user.deletedAt
    ) {
      throw this.invalidRefreshTokenException();
    }

    const newRefreshToken = this.tokenService.generate(
      AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
    );

    const newRefreshTokenHash = this.tokenService.hash(newRefreshToken);

    const rotated = await this.sessionService.rotateRefreshToken({
      sessionId: session.id,
      currentRefreshTokenHash,
      newRefreshTokenHash,
    });

    if (!rotated) {
      throw this.invalidRefreshTokenException();
    }

    const accessToken = await this.jwtService.generateAccessToken({
      sub: session.userId,
      sessionId: session.id,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.getAccessTokenExpirationSeconds(),
    };
  }

  private invalidRefreshTokenException(): BusinessException {
    return new BusinessException(
      ErrorCode.INVALID_REFRESH_TOKEN,
      AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
      401,
    );
  }
}
