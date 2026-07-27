import { BusinessException } from '@backend/common';
import { SecureTokenService } from '@backend/crypto';
import { UserMapper, type UserAuthProjection } from '@backend/modules/users';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  AUTH_ERROR_MESSAGES,
  AUTH_SESSION_DURATION,
  AUTH_TOKEN_CONFIG,
} from '../constants/auth.constants';
import { RefreshTokenRotationStatus } from '../contracts/refresh-token-rotation.result';
import type { SessionMetadata } from '../contracts/session-metadata';
import type { LoginDto } from '../dto/login.dto';
import type { RefreshDto } from '../dto/refresh.dto';
import type { SessionProjection } from '../persistence/session/session.projection';
import { SessionRepository } from '../persistence/session/session.repository';
import { AccessTokenService } from './access-token.service';
import { AuthenticationService } from './authentication.service';
import { CredentialsService } from './credentials.service';
import { RefreshTokenService } from './refresh-token.service';
import {
  AccessTokenServiceMock,
  ConfigServiceMock,
  createAccessTokenServiceMock,
  createConfigServiceMock,
  createCredentialsServiceMock,
  createRefreshTokenServiceMock,
  createSecureTokenServiceMock,
  createSessionRepositoryMock,
  CredentialsServiceMock,
  RefreshTokenServiceMock,
  SecureTokenServiceMock,
  SessionRepositoryMock,
} from '@test/mocks/auth';

describe('AuthenticationService', () => {
  let testingModule: TestingModule;
  let service: AuthenticationService;

  let credentialsServiceMock: CredentialsServiceMock;
  let sessionRepositoryMock: SessionRepositoryMock;
  let refreshTokenServiceMock: RefreshTokenServiceMock;
  let secureTokenServiceMock: SecureTokenServiceMock;
  let accessTokenServiceMock: AccessTokenServiceMock;
  let configServiceMock: ConfigServiceMock;

  const systemDate = new Date('2026-07-26T12:00:00.000Z');

  const user = {
    id: 'user-id',
    email: 'user@example.com',
    firstName: 'Fernando',
    lastName: 'Gorordo',
    password: 'hashed-password',
    isActive: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastFailedLoginAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    roles: [
      {
        role: {
          name: 'admin',
        },
      },
    ],
  } as unknown as UserAuthProjection;

  const session = {
    id: 'session-id',
  } as unknown as SessionProjection;

  const metadata: SessionMetadata = {
    userAgent: 'Mozilla/5.0',
    ipAddress: '127.0.0.1',
  };

  const createLoginDto = (rememberMe: boolean): LoginDto => ({
    email: 'user@example.com',
    password: 'plain-password',
    rememberMe,
  });

  const getExpectedSessionExpiration = (durationDays: number): Date => {
    const expectedExpiration = new Date(systemDate);

    expectedExpiration.setDate(expectedExpiration.getDate() + durationDays);

    return expectedExpiration;
  };

  const configureSuccessfulLoginMocks = (): void => {
    credentialsServiceMock.validate.mockResolvedValue(user);

    secureTokenServiceMock.generate.mockReturnValue('refresh-token');
    secureTokenServiceMock.hash.mockReturnValue('refresh-token-hash');

    sessionRepositoryMock.createWithRefreshToken.mockResolvedValue(session);

    accessTokenServiceMock.generate.mockResolvedValue('access-token');
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(systemDate);

    credentialsServiceMock = createCredentialsServiceMock();
    sessionRepositoryMock = createSessionRepositoryMock();
    refreshTokenServiceMock = createRefreshTokenServiceMock();
    secureTokenServiceMock = createSecureTokenServiceMock();
    accessTokenServiceMock = createAccessTokenServiceMock();
    configServiceMock = createConfigServiceMock();

    configServiceMock.getOrThrow.mockReturnValue('15m');

    testingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: CredentialsService,
          useValue: credentialsServiceMock,
        },
        {
          provide: SessionRepository,
          useValue: sessionRepositoryMock,
        },
        {
          provide: RefreshTokenService,
          useValue: refreshTokenServiceMock,
        },
        {
          provide: SecureTokenService,
          useValue: secureTokenServiceMock,
        },
        {
          provide: AccessTokenService,
          useValue: accessTokenServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = testingModule.get(AuthenticationService);
  });

  afterEach(async () => {
    await testingModule.close();

    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it('creates a session and returns the authentication result', async () => {
      const dto = createLoginDto(false);

      configureSuccessfulLoginMocks();

      const result = await service.login(dto, metadata);

      const expectedExpiration = getExpectedSessionExpiration(
        AUTH_SESSION_DURATION.DEFAULT_DAYS,
      );

      expect(credentialsServiceMock.validate).toHaveBeenCalledTimes(1);
      expect(credentialsServiceMock.validate).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );

      expect(secureTokenServiceMock.generate).toHaveBeenCalledTimes(1);
      expect(secureTokenServiceMock.generate).toHaveBeenCalledWith(
        AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
      );

      expect(secureTokenServiceMock.hash).toHaveBeenCalledTimes(1);
      expect(secureTokenServiceMock.hash).toHaveBeenCalledWith('refresh-token');

      expect(
        sessionRepositoryMock.createWithRefreshToken,
      ).toHaveBeenCalledTimes(1);

      expect(sessionRepositoryMock.createWithRefreshToken).toHaveBeenCalledWith(
        {
          userId: user.id,
          expiresAt: expectedExpiration,
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress,
          refreshTokenHash: 'refresh-token-hash',
        },
      );

      expect(accessTokenServiceMock.generate).toHaveBeenCalledTimes(1);
      expect(accessTokenServiceMock.generate).toHaveBeenCalledWith({
        sub: user.id,
        sessionId: session.id,
      });

      expect(configServiceMock.getOrThrow).toHaveBeenCalledTimes(1);
      expect(configServiceMock.getOrThrow).toHaveBeenCalledWith(
        'JWT_ACCESS_EXPIRES',
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        user: UserMapper.toResponse(user),
      });
    });

    it('uses the default session duration when remember-me is disabled', async () => {
      const dto = createLoginDto(false);

      configureSuccessfulLoginMocks();

      await service.login(dto, metadata);

      const expectedExpiration = getExpectedSessionExpiration(
        AUTH_SESSION_DURATION.DEFAULT_DAYS,
      );

      expect(sessionRepositoryMock.createWithRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expectedExpiration,
        }),
      );
    });

    it('uses the remember-me session duration when enabled', async () => {
      const dto = createLoginDto(true);

      configureSuccessfulLoginMocks();

      await service.login(dto, metadata);

      const expectedExpiration = getExpectedSessionExpiration(
        AUTH_SESSION_DURATION.REMEMBER_ME_DAYS,
      );

      expect(sessionRepositoryMock.createWithRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expectedExpiration,
        }),
      );
    });
  });

  describe('refresh', () => {
    const dto: RefreshDto = {
      refreshToken: 'current-refresh-token',
    };

    it('rotates the refresh token and returns a new token pair', async () => {
      secureTokenServiceMock.hash
        .mockReturnValueOnce('current-token-hash')
        .mockReturnValueOnce('new-token-hash');

      secureTokenServiceMock.generate.mockReturnValue('new-refresh-token');

      refreshTokenServiceMock.rotate.mockResolvedValue({
        status: RefreshTokenRotationStatus.ROTATED,
        userId: 'user-id',
        sessionId: 'session-id',
        newRefreshTokenId: 'new-refresh-token-id',
      });

      accessTokenServiceMock.generate.mockResolvedValue('new-access-token');

      const result = await service.refresh(dto);

      expect(secureTokenServiceMock.hash).toHaveBeenCalledTimes(2);
      expect(secureTokenServiceMock.hash).toHaveBeenNthCalledWith(
        1,
        dto.refreshToken,
      );

      expect(secureTokenServiceMock.generate).toHaveBeenCalledTimes(1);
      expect(secureTokenServiceMock.generate).toHaveBeenCalledWith(
        AUTH_TOKEN_CONFIG.REFRESH_TOKEN_BYTES,
      );

      expect(secureTokenServiceMock.hash).toHaveBeenNthCalledWith(
        2,
        'new-refresh-token',
      );

      expect(refreshTokenServiceMock.rotate).toHaveBeenCalledTimes(1);
      expect(refreshTokenServiceMock.rotate).toHaveBeenCalledWith({
        currentTokenHash: 'current-token-hash',
        newTokenHash: 'new-token-hash',
      });

      expect(accessTokenServiceMock.generate).toHaveBeenCalledTimes(1);
      expect(accessTokenServiceMock.generate).toHaveBeenCalledWith({
        sub: 'user-id',
        sessionId: 'session-id',
      });

      expect(configServiceMock.getOrThrow).toHaveBeenCalledWith(
        'JWT_ACCESS_EXPIRES',
      );

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });
    });

    it('throws when the refresh token is invalid', async () => {
      secureTokenServiceMock.hash
        .mockReturnValueOnce('current-token-hash')
        .mockReturnValueOnce('new-token-hash');

      secureTokenServiceMock.generate.mockReturnValue('new-refresh-token');

      refreshTokenServiceMock.rotate.mockResolvedValue({
        status: RefreshTokenRotationStatus.INVALID,
      });

      let thrownError: unknown;

      try {
        await service.refresh(dto);
      } catch (error: unknown) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(BusinessException);
      expect(thrownError).toMatchObject({
        message: AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
      });

      expect(accessTokenServiceMock.generate).not.toHaveBeenCalled();
      expect(configServiceMock.getOrThrow).not.toHaveBeenCalled();
    });

    it('throws when refresh-token reuse is detected', async () => {
      secureTokenServiceMock.hash
        .mockReturnValueOnce('current-token-hash')
        .mockReturnValueOnce('new-token-hash');

      secureTokenServiceMock.generate.mockReturnValue('new-refresh-token');

      refreshTokenServiceMock.rotate.mockResolvedValue({
        status: RefreshTokenRotationStatus.REUSE_DETECTED,
        userId: 'user-id',
        sessionId: 'session-id',
      });

      const refreshPromise = service.refresh(dto);

      await expect(refreshPromise).rejects.toBeInstanceOf(BusinessException);

      expect(accessTokenServiceMock.generate).not.toHaveBeenCalled();
      expect(configServiceMock.getOrThrow).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('revokes the requested session', async () => {
      sessionRepositoryMock.revokeById.mockResolvedValue(true);

      await service.logout('session-id');

      expect(sessionRepositoryMock.revokeById).toHaveBeenCalledTimes(1);
      expect(sessionRepositoryMock.revokeById).toHaveBeenCalledWith(
        'session-id',
      );
    });
  });
});
