import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import {
  createConfigServiceMock,
  createSessionRepositoryMock,
  type ConfigServiceMock,
  type SessionRepositoryMock,
} from '@test/mocks';

import { SessionRepository } from '../persistence/session/session.repository';
import type { JwtPayload } from '../types/jwt-payload.type';
import { JwtStrategy } from './jwt.strategy';
import { AuthorizationSessionBuilder } from '@test/builders/authorization-session.builder';

describe('JwtStrategy', () => {
  let testingModule: TestingModule;
  let strategy: JwtStrategy;

  let configServiceMock: ConfigServiceMock;
  let sessionRepositoryMock: SessionRepositoryMock;

  const accessSecret = 'test-access-secret';

  const payload: JwtPayload = {
    sub: 'user-id',
    sessionId: 'session-id',
    email: 'user@example.com',
  };

  beforeEach(async () => {
    configServiceMock = createConfigServiceMock();
    sessionRepositoryMock = createSessionRepositoryMock();

    configServiceMock.getOrThrow.mockReturnValue(accessSecret);

    testingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: SessionRepository,
          useValue: sessionRepositoryMock,
        },
      ],
    }).compile();

    strategy = testingModule.get(JwtStrategy);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.restoreAllMocks();
  });

  it('reads the JWT access secret from configuration', () => {
    expect(configServiceMock.getOrThrow).toHaveBeenCalledTimes(1);

    expect(configServiceMock.getOrThrow).toHaveBeenCalledWith(
      'JWT_ACCESS_SECRET',
    );
  });

  describe('validate', () => {
    it('throws UnauthorizedException when sub is missing', async () => {
      const invalidPayload: JwtPayload = {
        ...payload,
        sub: '',
      };

      await expect(strategy.validate(invalidPayload)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(sessionRepositoryMock.findForAuthorization).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when sessionId is missing', async () => {
      const invalidPayload: JwtPayload = {
        ...payload,
        sessionId: '',
      };

      await expect(strategy.validate(invalidPayload)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(sessionRepositoryMock.findForAuthorization).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the session does not exist', async () => {
      sessionRepositoryMock.findForAuthorization.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(sessionRepositoryMock.findForAuthorization).toHaveBeenCalledTimes(
        1,
      );

      expect(sessionRepositoryMock.findForAuthorization).toHaveBeenCalledWith(
        payload.sessionId,
        payload.sub,
      );
    });

    it('returns the authenticated user with roles and unique permissions', async () => {
      const session = new AuthorizationSessionBuilder()
        .withRole('ADMIN', ['users.read', 'users.write'])
        .withRole('MANAGER', ['users.read', 'reports.read'])
        .build();

      sessionRepositoryMock.findForAuthorization.mockResolvedValue(session);

      const result = await strategy.validate(payload);

      expect(sessionRepositoryMock.findForAuthorization).toHaveBeenCalledTimes(
        1,
      );

      expect(sessionRepositoryMock.findForAuthorization).toHaveBeenCalledWith(
        'session-id',
        'user-id',
      );

      expect(result).toEqual({
        userId: 'user-id',
        sessionId: 'session-id',
        email: 'user@example.com',
        roles: ['ADMIN', 'MANAGER'],
        permissions: ['users.read', 'users.write', 'reports.read'],
      });
    });

    it('returns empty roles and permissions when the user has no roles', async () => {
      const session = new AuthorizationSessionBuilder().withoutRoles().build();

      sessionRepositoryMock.findForAuthorization.mockResolvedValue(session);

      const result = await strategy.validate(payload);

      expect(sessionRepositoryMock.findForAuthorization).toHaveBeenCalledWith(
        'session-id',
        'user-id',
      );

      expect(result).toEqual({
        userId: 'user-id',
        sessionId: 'session-id',
        email: 'user@example.com',
        roles: [],
        permissions: [],
      });
    });

    it('uses the session and user values returned by the repository', async () => {
      const session = new AuthorizationSessionBuilder()
        .withId('custom-session-id')
        .withUserId('custom-user-id')
        .withEmail('custom@example.com')
        .withRole('USER', ['profile.read'])
        .build();

      sessionRepositoryMock.findForAuthorization.mockResolvedValue(session);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'custom-user-id',
        sessionId: 'custom-session-id',
        email: 'custom@example.com',
        roles: ['USER'],
        permissions: ['profile.read'],
      });
    });
  });
});
