import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import type { StringValue } from 'ms';

import { CredentialsService } from './credentials.service';
import { RefreshTokenService } from './refresh-token.service';
import { ErrorCode } from '@erp/api-contracts';
import { SecureTokenService } from '@backend/crypto';
import { AccessTokenService } from './access-token.service';
import type { SessionMetadata } from '../contracts/session-metadata';
import { LoginDto } from '../dto/login.dto';
import type { LoginResult } from '../contracts/login.result';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SESSION_DURATION,
  AUTH_TOKEN_CONFIG,
} from '../constants/auth.constants';
import { RefreshDto } from '../dto/refresh.dto';
import type { TokenPairResult } from '../contracts/token-pair.result';
import { RefreshTokenRotationStatus } from '../contracts/refresh-token-rotation.result';
import { BusinessException } from '@backend/common';
import { SessionRepository } from '../persistence/session/session.repository';
import { UserMapper } from '@backend/modules/users';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly secureTokenService: SecureTokenService,
    private readonly accessTokenService: AccessTokenService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, metadata: SessionMetadata): Promise<LoginResult> {
    const user = await this.credentialsService.validate(
      dto.email,
      dto.password,
    );

    const expiresAt = this.getSessionExpiration(dto.rememberMe);

    const refreshToken = this.secureTokenService.generate(
      AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
    );

    const refreshTokenHash = this.secureTokenService.hash(refreshToken);

    const session = await this.sessionRepository.createWithRefreshToken({
      userId: user.id,
      expiresAt,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      refreshTokenHash,
    });

    const accessToken = await this.accessTokenService.generate({
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

  async refresh(dto: RefreshDto): Promise<TokenPairResult> {
    const currentTokenHash = this.secureTokenService.hash(dto.refreshToken);

    const newRefreshToken = this.secureTokenService.generate(
      AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
    );

    const newTokenHash = this.secureTokenService.hash(newRefreshToken);

    const rotation = await this.refreshTokenService.rotate({
      currentTokenHash,
      newTokenHash,
    });

    if (rotation.status !== RefreshTokenRotationStatus.ROTATED) {
      throw this.invalidRefreshTokenException();
    }

    const accessToken = await this.accessTokenService.generate({
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
    await this.sessionRepository.revokeById(sessionId);
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
