import { UsersService } from '@backend/modules/users';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  createUsersServiceMock,
  type UsersServiceMock,
} from '@test/mocks/users';

import {
  createConfigServiceMock,
  type ConfigServiceMock,
} from '@test/mocks/auth/config-service.mock';

import { AccountLockoutService } from './account-lockout.service';

describe('AccountLockoutService', () => {
  let testingModule: TestingModule;
  let service: AccountLockoutService;

  let usersServiceMock: UsersServiceMock;
  let configServiceMock: ConfigServiceMock;

  const userId = 'user-id';
  const now = new Date('2026-07-27T12:00:00.000Z');

  const maxFailedAttempts = 5;
  const lockoutDurationMs = 15 * 60 * 1000;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    usersServiceMock = createUsersServiceMock();
    configServiceMock = createConfigServiceMock();

    testingModule = await Test.createTestingModule({
      providers: [
        AccountLockoutService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = testingModule.get(AccountLockoutService);
  });

  afterEach(async () => {
    await testingModule.close();

    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('isLocked', () => {
    it('returns false when lockedUntil is null', async () => {
      const result = await service.isLocked(userId, null);

      expect(result).toBe(false);
      expect(usersServiceMock.resetLoginFailures).not.toHaveBeenCalled();
    });

    it('returns true when the lockout is still active', async () => {
      const lockedUntil = new Date(now.getTime() + lockoutDurationMs);

      const result = await service.isLocked(userId, lockedUntil);

      expect(result).toBe(true);
      expect(usersServiceMock.resetLoginFailures).not.toHaveBeenCalled();
    });

    it('resets login failures when the lockout has expired', async () => {
      const lockedUntil = new Date(now.getTime() - 1);

      usersServiceMock.resetLoginFailures.mockResolvedValue(undefined);

      const result = await service.isLocked(userId, lockedUntil);

      expect(result).toBe(false);
      expect(usersServiceMock.resetLoginFailures).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.resetLoginFailures).toHaveBeenCalledWith(userId);
    });

    it('treats a lockout ending exactly now as expired', async () => {
      usersServiceMock.resetLoginFailures.mockResolvedValue(undefined);

      const result = await service.isLocked(userId, now);

      expect(result).toBe(false);
      expect(usersServiceMock.resetLoginFailures).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.resetLoginFailures).toHaveBeenCalledWith(userId);
    });
  });

  describe('registerFailure', () => {
    beforeEach(() => {
      (configServiceMock.getOrThrow as jest.Mock).mockImplementation((key) => {
        if (key === 'AUTH_MAX_FAILED_ATTEMPTS') {
          return maxFailedAttempts;
        }

        if (key === 'AUTH_LOCKOUT_DURATION_MS') {
          return lockoutDurationMs;
        }

        throw new Error(`Unexpected config key: ${key}`);
      });
    });

    it('increments failed attempts without locking when the threshold is not reached', async () => {
      usersServiceMock.incrementFailedLoginAttempts.mockResolvedValue({
        failedLoginAttempts: maxFailedAttempts - 1,
      });

      await service.registerFailure(userId);

      expect(configServiceMock.getOrThrow).toHaveBeenCalledTimes(2);

      expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
        1,
        'AUTH_MAX_FAILED_ATTEMPTS',
      );

      expect(configServiceMock.getOrThrow).toHaveBeenNthCalledWith(
        2,
        'AUTH_LOCKOUT_DURATION_MS',
      );

      expect(
        usersServiceMock.incrementFailedLoginAttempts,
      ).toHaveBeenCalledTimes(1);

      expect(
        usersServiceMock.incrementFailedLoginAttempts,
      ).toHaveBeenCalledWith(userId, now);

      expect(usersServiceMock.setLockedUntil).not.toHaveBeenCalled();
    });

    it('locks the account when the failed-attempt threshold is reached', async () => {
      usersServiceMock.incrementFailedLoginAttempts.mockResolvedValue({
        failedLoginAttempts: maxFailedAttempts,
      });

      usersServiceMock.setLockedUntil.mockResolvedValue(undefined);

      await service.registerFailure(userId);

      expect(usersServiceMock.setLockedUntil).toHaveBeenCalledTimes(1);

      expect(usersServiceMock.setLockedUntil).toHaveBeenCalledWith(
        userId,
        new Date(now.getTime() + lockoutDurationMs),
      );
    });

    it('locks the account when failed attempts exceed the threshold', async () => {
      usersServiceMock.incrementFailedLoginAttempts.mockResolvedValue({
        failedLoginAttempts: maxFailedAttempts + 1,
      });

      usersServiceMock.setLockedUntil.mockResolvedValue(undefined);

      await service.registerFailure(userId);

      expect(usersServiceMock.setLockedUntil).toHaveBeenCalledTimes(1);

      expect(usersServiceMock.setLockedUntil).toHaveBeenCalledWith(
        userId,
        new Date(now.getTime() + lockoutDurationMs),
      );
    });
  });

  describe('reset', () => {
    it('resets login failures for the user', async () => {
      usersServiceMock.resetLoginFailures.mockResolvedValue(undefined);

      await service.reset(userId);

      expect(usersServiceMock.resetLoginFailures).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.resetLoginFailures).toHaveBeenCalledWith(userId);
    });

    it('propagates reset errors', async () => {
      const error = new Error('reset failed');

      usersServiceMock.resetLoginFailures.mockRejectedValue(error);

      await expect(service.reset(userId)).rejects.toThrow(error);
    });
  });
});
