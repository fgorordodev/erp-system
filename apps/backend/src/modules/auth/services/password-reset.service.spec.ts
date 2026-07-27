import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import type { Prisma } from '@erp/database';

import { BusinessException } from '@backend/common';
import { PasswordHasherService, SecureTokenService } from '@backend/crypto';
import { UsersService } from '@backend/modules/users';

import {
  createConfigServiceMock,
  createPasswordHasherServiceMock,
  createPasswordResetNotificationServiceMock,
  createPasswordResetTokenRepositoryMock,
  createSecureTokenServiceMock,
  createSessionRepositoryMock,
  createUsersServiceMock,
  type ConfigServiceMock,
  type PasswordHasherServiceMock,
  type PasswordResetNotificationServiceMock,
  type PasswordResetTokenRepositoryMock,
  type SecureTokenServiceMock,
  type SessionRepositoryMock,
  type UsersServiceMock,
} from '@test/mocks';

import type { UserAuthProjection } from '../../users/persistence/user.projection';
import type { ResetPasswordDto } from '../dto/reset-password.dto';
import { PasswordResetTokenRepository } from '../persistence/password-reset-token/password-reset-token.repository';
import { SessionRepository } from '../persistence/session/session.repository';
import { PasswordResetNotificationService } from './password-reset-notification.service';
import { PasswordResetService } from './password-reset.service';

describe('PasswordResetService', () => {
  let testingModule: TestingModule;
  let service: PasswordResetService;

  let usersServiceMock: UsersServiceMock;
  let passwordHasherServiceMock: PasswordHasherServiceMock;
  let secureTokenServiceMock: SecureTokenServiceMock;
  let passwordResetTokenRepositoryMock: PasswordResetTokenRepositoryMock;
  let notificationServiceMock: PasswordResetNotificationServiceMock;
  let configServiceMock: ConfigServiceMock;
  let sessionRepositoryMock: SessionRepositoryMock;

  const now = new Date('2026-07-27T12:00:00.000Z');

  /*
   * Prisma.TransactionClient expone el cliente completo generado por Prisma.
   * PasswordResetService solamente transmite esta referencia entre dependencias.
   */
  const transaction = {} as Prisma.TransactionClient;

  const createActiveUser = (
    overrides: Partial<UserAuthProjection> = {},
  ): UserAuthProjection =>
    ({
      id: 'user-id',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'current-password-hash',
      isActive: true,
      deletedAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      roles: [],
      ...overrides,
    }) as UserAuthProjection;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    usersServiceMock = createUsersServiceMock();
    passwordHasherServiceMock = createPasswordHasherServiceMock();
    secureTokenServiceMock = createSecureTokenServiceMock();
    passwordResetTokenRepositoryMock = createPasswordResetTokenRepositoryMock();
    notificationServiceMock = createPasswordResetNotificationServiceMock();
    configServiceMock = createConfigServiceMock();
    sessionRepositoryMock = createSessionRepositoryMock();

    passwordResetTokenRepositoryMock.withTransaction.mockImplementation(
      (operation) => operation(transaction),
    );

    testingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: PasswordHasherService,
          useValue: passwordHasherServiceMock,
        },
        {
          provide: SecureTokenService,
          useValue: secureTokenServiceMock,
        },
        {
          provide: PasswordResetTokenRepository,
          useValue: passwordResetTokenRepositoryMock,
        },
        {
          provide: PasswordResetNotificationService,
          useValue: notificationServiceMock,
        },
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

    service = testingModule.get(PasswordResetService);
  });

  afterEach(async () => {
    await testingModule.close();

    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('request', () => {
    it('normalizes the email before searching for the user', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      await service.request('  USER@Example.COM  ');

      expect(usersServiceMock.findByEmail).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
    });

    it('does nothing when the account does not exist', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      await expect(
        service.request('missing@example.com'),
      ).resolves.toBeUndefined();

      expect(secureTokenServiceMock.generate).not.toHaveBeenCalled();
      expect(secureTokenServiceMock.hash).not.toHaveBeenCalled();

      expect(
        passwordResetTokenRepositoryMock.revokeActiveByUserId,
      ).not.toHaveBeenCalled();

      expect(passwordResetTokenRepositoryMock.create).not.toHaveBeenCalled();

      expect(notificationServiceMock.send).not.toHaveBeenCalled();
    });

    it('does nothing when the account is inactive', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(
        createActiveUser({
          isActive: false,
        }),
      );

      await expect(
        service.request('user@example.com'),
      ).resolves.toBeUndefined();

      expect(secureTokenServiceMock.generate).not.toHaveBeenCalled();
      expect(secureTokenServiceMock.hash).not.toHaveBeenCalled();

      expect(
        passwordResetTokenRepositoryMock.revokeActiveByUserId,
      ).not.toHaveBeenCalled();

      expect(passwordResetTokenRepositoryMock.create).not.toHaveBeenCalled();

      expect(notificationServiceMock.send).not.toHaveBeenCalled();
    });

    it('creates a password reset token and sends the notification', async () => {
      const tokenBytes = 32;
      const expiresInMs = 30 * 60 * 1000;

      const token = 'plain-password-reset-token';
      const tokenHash = 'password-reset-token-hash';

      const user = createActiveUser();

      usersServiceMock.findByEmail.mockResolvedValue(user);

      configServiceMock.getOrThrow
        .mockReturnValueOnce(tokenBytes)
        .mockReturnValueOnce(expiresInMs);

      secureTokenServiceMock.generate.mockReturnValue(token);
      secureTokenServiceMock.hash.mockReturnValue(tokenHash);

      passwordResetTokenRepositoryMock.revokeActiveByUserId.mockResolvedValue(
        1,
      );

      passwordResetTokenRepositoryMock.create.mockResolvedValue(undefined);
      notificationServiceMock.send.mockResolvedValue(undefined);

      await service.request('  USER@EXAMPLE.COM  ');

      expect(configServiceMock.getOrThrow).toHaveBeenCalledTimes(2);

      expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
        1,
        'AUTH_PASSWORD_RESET_TOKEN_BYTES',
      );

      expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
        2,
        'AUTH_PASSWORD_RESET_EXPIRES_MS',
      );

      expect(secureTokenServiceMock.generate).toHaveBeenCalledTimes(1);
      expect(secureTokenServiceMock.generate).toHaveBeenCalledWith(tokenBytes);

      expect(secureTokenServiceMock.hash).toHaveBeenCalledTimes(1);
      expect(secureTokenServiceMock.hash).toHaveBeenCalledWith(token);

      expect(
        passwordResetTokenRepositoryMock.revokeActiveByUserId,
      ).toHaveBeenCalledTimes(1);

      expect(
        passwordResetTokenRepositoryMock.revokeActiveByUserId,
      ).toHaveBeenCalledWith(user.id);

      expect(passwordResetTokenRepositoryMock.create).toHaveBeenCalledTimes(1);

      expect(passwordResetTokenRepositoryMock.create).toHaveBeenCalledWith({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(now.getTime() + expiresInMs),
      });

      expect(notificationServiceMock.send).toHaveBeenCalledTimes(1);

      expect(notificationServiceMock.send).toHaveBeenCalledWith({
        email: user.email,
        firstName: user.firstName,
        token,
      });
    });

    it('revokes previous active tokens before creating the new token', async () => {
      const callOrder: string[] = [];
      const user = createActiveUser();

      usersServiceMock.findByEmail.mockResolvedValue(user);

      configServiceMock.getOrThrow
        .mockReturnValueOnce(32)
        .mockReturnValueOnce(1_800_000);

      secureTokenServiceMock.generate.mockReturnValue('plain-token');
      secureTokenServiceMock.hash.mockReturnValue('token-hash');

      passwordResetTokenRepositoryMock.revokeActiveByUserId.mockImplementation(
        () => {
          callOrder.push('revoke');

          return Promise.resolve(1);
        },
      );

      passwordResetTokenRepositoryMock.create.mockImplementation(() => {
        callOrder.push('create');

        return Promise.resolve();
      });

      notificationServiceMock.send.mockImplementation(() => {
        callOrder.push('notify');

        return Promise.resolve();
      });

      await service.request(user.email);

      expect(callOrder).toEqual(['revoke', 'create', 'notify']);
    });
  });

  describe('reset', () => {
    const dto: ResetPasswordDto = {
      token: 'plain-password-reset-token',
      password: 'NewStrongPassword123!',
    };

    const tokenHash = 'password-reset-token-hash';
    const passwordHash = 'new-password-hash';

    beforeEach(() => {
      secureTokenServiceMock.hash.mockReturnValue(tokenHash);
      passwordHasherServiceMock.hash.mockResolvedValue(passwordHash);
    });

    it('throws BusinessException when the reset token is invalid', async () => {
      passwordResetTokenRepositoryMock.findValidByHashForUpdate.mockResolvedValue(
        null,
      );

      await expect(service.reset(dto)).rejects.toBeInstanceOf(
        BusinessException,
      );

      expect(secureTokenServiceMock.hash).toHaveBeenCalledTimes(1);
      expect(secureTokenServiceMock.hash).toHaveBeenCalledWith(dto.token);

      expect(passwordHasherServiceMock.hash).toHaveBeenCalledTimes(1);
      expect(passwordHasherServiceMock.hash).toHaveBeenCalledWith(dto.password);

      expect(
        passwordResetTokenRepositoryMock.findValidByHashForUpdate,
      ).toHaveBeenCalledTimes(1);

      expect(
        passwordResetTokenRepositoryMock.findValidByHashForUpdate,
      ).toHaveBeenCalledWith(transaction, tokenHash, now);

      expect(passwordResetTokenRepositoryMock.consume).not.toHaveBeenCalled();

      expect(usersServiceMock.updatePassword).not.toHaveBeenCalled();

      expect(
        passwordResetTokenRepositoryMock.revokeOtherActiveTokens,
      ).not.toHaveBeenCalled();

      expect(sessionRepositoryMock.revokeAllByUserId).not.toHaveBeenCalled();

      expect(usersServiceMock.resetLoginFailures).not.toHaveBeenCalled();
    });

    it('throws BusinessException when the token cannot be consumed', async () => {
      const resetToken = {
        id: 'reset-token-id',
        userId: 'user-id',
      };

      passwordResetTokenRepositoryMock.findValidByHashForUpdate.mockResolvedValue(
        resetToken,
      );

      passwordResetTokenRepositoryMock.consume.mockResolvedValue(false);

      await expect(service.reset(dto)).rejects.toBeInstanceOf(
        BusinessException,
      );

      expect(passwordResetTokenRepositoryMock.consume).toHaveBeenCalledTimes(1);

      expect(passwordResetTokenRepositoryMock.consume).toHaveBeenCalledWith(
        transaction,
        resetToken.id,
        now,
      );

      expect(usersServiceMock.updatePassword).not.toHaveBeenCalled();

      expect(
        passwordResetTokenRepositoryMock.revokeOtherActiveTokens,
      ).not.toHaveBeenCalled();

      expect(sessionRepositoryMock.revokeAllByUserId).not.toHaveBeenCalled();

      expect(usersServiceMock.resetLoginFailures).not.toHaveBeenCalled();
    });

    it('changes the password and invalidates active authentication state', async () => {
      const resetToken = {
        id: 'reset-token-id',
        userId: 'user-id',
      };

      passwordResetTokenRepositoryMock.findValidByHashForUpdate.mockResolvedValue(
        resetToken,
      );

      passwordResetTokenRepositoryMock.consume.mockResolvedValue(true);
      usersServiceMock.updatePassword.mockResolvedValue(undefined);

      passwordResetTokenRepositoryMock.revokeOtherActiveTokens.mockResolvedValue(
        undefined,
      );

      sessionRepositoryMock.revokeAllByUserId.mockResolvedValue(undefined);
      usersServiceMock.resetLoginFailures.mockResolvedValue(undefined);

      await expect(service.reset(dto)).resolves.toBeUndefined();

      expect(
        passwordResetTokenRepositoryMock.withTransaction,
      ).toHaveBeenCalledTimes(1);

      expect(
        passwordResetTokenRepositoryMock.findValidByHashForUpdate,
      ).toHaveBeenCalledWith(transaction, tokenHash, now);

      expect(passwordResetTokenRepositoryMock.consume).toHaveBeenCalledWith(
        transaction,
        resetToken.id,
        now,
      );

      expect(usersServiceMock.updatePassword).toHaveBeenCalledWith(
        resetToken.userId,
        passwordHash,
        transaction,
      );

      expect(
        passwordResetTokenRepositoryMock.revokeOtherActiveTokens,
      ).toHaveBeenCalledWith(
        transaction,
        resetToken.userId,
        resetToken.id,
        now,
      );

      expect(sessionRepositoryMock.revokeAllByUserId).toHaveBeenCalledWith(
        resetToken.userId,
        now,
        transaction,
      );

      expect(usersServiceMock.resetLoginFailures).toHaveBeenCalledWith(
        resetToken.userId,
        transaction,
      );
    });

    it('executes the reset operations in the required order', async () => {
      const resetToken = {
        id: 'reset-token-id',
        userId: 'user-id',
      };

      const callOrder: string[] = [];

      passwordResetTokenRepositoryMock.findValidByHashForUpdate.mockImplementation(
        () => {
          callOrder.push('find-token');

          return Promise.resolve(resetToken);
        },
      );

      passwordResetTokenRepositoryMock.consume.mockImplementation(() => {
        callOrder.push('consume-token');

        return Promise.resolve(true);
      });

      usersServiceMock.updatePassword.mockImplementation(() => {
        callOrder.push('update-password');

        return Promise.resolve();
      });

      passwordResetTokenRepositoryMock.revokeOtherActiveTokens.mockImplementation(
        () => {
          callOrder.push('revoke-other-tokens');

          return Promise.resolve();
        },
      );

      sessionRepositoryMock.revokeAllByUserId.mockImplementation(() => {
        callOrder.push('revoke-sessions');

        return Promise.resolve();
      });

      usersServiceMock.resetLoginFailures.mockImplementation(() => {
        callOrder.push('reset-login-failures');

        return Promise.resolve();
      });

      await service.reset(dto);

      expect(callOrder).toEqual([
        'find-token',
        'consume-token',
        'update-password',
        'revoke-other-tokens',
        'revoke-sessions',
        'reset-login-failures',
      ]);
    });
  });
});
