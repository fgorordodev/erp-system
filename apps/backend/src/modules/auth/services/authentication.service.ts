import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import type { StringValue } from 'ms';

import { BusinessException, ErrorCode } from '@backend/common';
import { JwtService } from '@backend/security/jwt';
import { TokenService } from '@backend/security/token';
import { UserMapper } from '@backend/modules/users';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SESSION_DURATION,
  AUTH_TOKEN_CONFIG,
} from '@backend/modules/auth/constants';
import { LoginDto, RefreshDto } from '@backend/modules/auth/dto';
import {
  LoginResponse,
  RefreshTokenRotationStatus,
  SessionMetadata,
  TokenPair,
} from '@backend/modules/auth/interfaces';
import { CredentialsService } from './credentials.service';
import { SessionService } from './session.service';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly sessionService: SessionService,
    private readonly refreshTokenService: RefreshTokenService,
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

    const expiresAt = this.getSessionExpiration(dto.rememberMe);

    const refreshToken = this.tokenService.generate(
      AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
    );

    const refreshTokenHash = this.tokenService.hash(refreshToken);

    const session = await this.sessionService.create({
      userId: user.id,
      expiresAt,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });

    await this.refreshTokenService.create({
      sessionId: session.id,
      tokenHash: refreshTokenHash,
      expiresAt,
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
      expiresIn: this.getAccessTokenExpirationSeconds(),
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.revokeById(sessionId);
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

  private invalidRefreshTokenException(): BusinessException {
    return new BusinessException(
      ErrorCode.INVALID_REFRESH_TOKEN,
      AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
      401,
    );
  }
}
