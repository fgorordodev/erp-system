import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import type { StringValue } from 'ms';

import { HashService, JwtService, TokenService } from '../../../security';
import { UserMapper } from '../../users';
import { AUTH_SESSION_DURATION, AUTH_TOKEN_CONFIG } from '../constants';
import { LoginDto } from '../dto';
import { LoginResponse, SessionMetadata } from '../interfaces';
import { CredentialsService } from './credentials.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly credentialsService: CredentialsService,
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
    const user = await this.credentialsService.validate(
      dto.email,
      dto.password,
    );

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
}
