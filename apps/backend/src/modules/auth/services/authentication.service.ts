import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms, { type StringValue } from 'ms';

import { BusinessException, ErrorCode } from '@backend/common';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SESSION_DURATION,
  AUTH_TOKEN_CONFIG,
} from '@backend/modules/auth/constants';
import type { LoginDto, RefreshDto } from '@backend/modules/auth/dto';
import {
  RefreshTokenRotationStatus,
  type LoginResponse,
  type SessionMetadata,
  type TokenPair,
} from '@backend/modules/auth/interfaces';
import { UserMapper } from '@backend/modules/users';
import { JwtService } from '@backend/security/jwt';
import { TokenService } from '@backend/security/token';

import { CredentialsService } from './credentials.service';
import { RefreshTokenService } from './refresh-token.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthenticationService {
  private readonly accessTokenExpirationSeconds: number;

  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly sessionService: SessionService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    const accessTokenDuration =
      configService.getOrThrow<StringValue>('JWT_ACCESS_EXPIRES');

    this.accessTokenExpirationSeconds = Math.floor(
      ms(accessTokenDuration) / 1000,
    );
  }

  async login(
    dto: LoginDto,
    metadata: SessionMetadata,
  ): Promise<LoginResponse> {
    const user = await this.credentialsService.validate(
      dto.email,
      dto.password,
    );

    const expiresAt = this.getSessionExpiration(dto.rememberMe);

    const refreshToken = this.tokenService.generate(
      AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
    );

    const refreshTokenHash = this.tokenService.hash(refreshToken);

    const session = await this.sessionService.createWithRefreshToken({
      userId: user.id,
      expiresAt,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      refreshTokenHash,
    });

    try {
      const accessToken = await this.jwtService.generateAccessToken({
        sub: user.id,
        sessionId: session.id,
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: this.accessTokenExpirationSeconds,
        user: UserMapper.toResponse(user),
      };
    } catch (error: unknown) {
      await this.sessionService.revokeById(session.id);

      throw error;
    }
  }

  async refresh(dto: RefreshDto): Promise<TokenPair> {
    const currentTokenHash = this.tokenService.hash(dto.refreshToken);

    const newRefreshToken = this.tokenService.generate(
      AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
    );

    const newTokenHash = this.tokenService.hash(newRefreshToken);

    const rotation = await this.refreshTokenService.rotate({
      currentTokenHash,
      newTokenHash,
    });

    if (rotation.status !== RefreshTokenRotationStatus.ROTATED) {
      throw this.invalidRefreshTokenException();
    }

    const accessToken = await this.jwtService.generateAccessToken({
      sub: rotation.userId,
      sessionId: rotation.sessionId,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.accessTokenExpirationSeconds,
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.revokeById(sessionId);
  }

  private getSessionExpiration(rememberMe: boolean): Date {
    const durationDays = rememberMe
      ? AUTH_SESSION_DURATION.REMEMBER_ME_DAYS
      : AUTH_SESSION_DURATION.DEFAULT_DAYS;

    const durationMilliseconds = durationDays * 24 * 60 * 60 * 1000;

    return new Date(Date.now() + durationMilliseconds);
  }

  private invalidRefreshTokenException(): BusinessException {
    return new BusinessException(
      ErrorCode.INVALID_REFRESH_TOKEN,
      AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
      HttpStatus.UNAUTHORIZED,
    );
  }
}
