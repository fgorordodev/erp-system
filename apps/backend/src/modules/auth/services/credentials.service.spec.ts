import { BusinessException } from '@backend/common';
import { PasswordHasherService } from '@backend/crypto';
import { type UserAuthProjection, UsersService } from '@backend/modules/users';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  createAccountLockoutServiceMock,
  createPasswordHasherServiceMock,
  createUsersServiceMock,
  type AccountLockoutServiceMock,
  type PasswordHasherServiceMock,
  type UsersServiceMock,
} from '@test/mocks';

import { AUTH_ERROR_MESSAGES } from '../constants/auth.constants';
import { AccountLockoutService } from './account-lockout.service';
import { CredentialsService } from './credentials.service';

describe('CredentialsService', () => {
  let testingModule: TestingModule;
  let service: CredentialsService;

  let usersServiceMock: UsersServiceMock;
  let passwordHasherServiceMock: PasswordHasherServiceMock;
  let accountLockoutServiceMock: AccountLockoutServiceMock;

  const email = 'user@example.com';
  const plainPassword = 'plain-password';

  const createUser = (
    overrides: Partial<UserAuthProjection> = {},
  ): UserAuthProjection =>
    ({
      id: 'user-id',
      email,
      password: 'hashed-password',
      firstName: 'Fernando',
      lastName: 'Gorordo',
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
      ...overrides,
    }) as unknown as UserAuthProjection;

  beforeEach(async () => {
    usersServiceMock = createUsersServiceMock();
    passwordHasherServiceMock = createPasswordHasherServiceMock();
    accountLockoutServiceMock = createAccountLockoutServiceMock();

    testingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: PasswordHasherService,
          useValue: passwordHasherServiceMock,
        },
        {
          provide: AccountLockoutService,
          useValue: accountLockoutServiceMock,
        },
      ],
    }).compile();

    service = testingModule.get(CredentialsService);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.restoreAllMocks();
  });

  describe('validate', () => {
    it('returns the user when the credentials are valid', async () => {
      const user = createUser();

      usersServiceMock.findByEmail.mockResolvedValue(user);
      accountLockoutServiceMock.isLocked.mockResolvedValue(false);
      passwordHasherServiceMock.compare.mockResolvedValue(true);

      const result = await service.validate(email, plainPassword);

      expect(usersServiceMock.findByEmail).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(email);

      expect(accountLockoutServiceMock.isLocked).toHaveBeenCalledTimes(1);
      expect(accountLockoutServiceMock.isLocked).toHaveBeenCalledWith(
        user.id,
        user.lockedUntil,
      );

      expect(passwordHasherServiceMock.compare).toHaveBeenCalledTimes(1);
      expect(passwordHasherServiceMock.compare).toHaveBeenCalledWith(
        plainPassword,
        user.password,
      );

      expect(accountLockoutServiceMock.registerFailure).not.toHaveBeenCalled();

      expect(accountLockoutServiceMock.reset).not.toHaveBeenCalled();

      expect(result).toBe(user);
    });

    it('throws invalid credentials when the user does not exist', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      let thrownError: unknown;

      try {
        await service.validate(email, plainPassword);
      } catch (error: unknown) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(BusinessException);
      expect(thrownError).toMatchObject({
        message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      });

      expect(accountLockoutServiceMock.isLocked).not.toHaveBeenCalled();
      expect(passwordHasherServiceMock.compare).not.toHaveBeenCalled();

      expect(accountLockoutServiceMock.registerFailure).not.toHaveBeenCalled();

      expect(accountLockoutServiceMock.reset).not.toHaveBeenCalled();
    });

    it('throws invalid credentials when the account is locked', async () => {
      const lockedUntil = new Date('2026-07-27T12:00:00.000Z');
      const user = createUser({ lockedUntil });

      usersServiceMock.findByEmail.mockResolvedValue(user);
      accountLockoutServiceMock.isLocked.mockResolvedValue(true);

      const validationPromise = service.validate(email, plainPassword);

      await expect(validationPromise).rejects.toMatchObject({
        message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      });

      expect(accountLockoutServiceMock.isLocked).toHaveBeenCalledWith(
        user.id,
        lockedUntil,
      );

      expect(passwordHasherServiceMock.compare).not.toHaveBeenCalled();

      expect(accountLockoutServiceMock.registerFailure).not.toHaveBeenCalled();

      expect(accountLockoutServiceMock.reset).not.toHaveBeenCalled();
    });

    it('registers a failure and throws when the password is incorrect for an active user', async () => {
      const user = createUser({ isActive: true });

      usersServiceMock.findByEmail.mockResolvedValue(user);
      accountLockoutServiceMock.isLocked.mockResolvedValue(false);
      passwordHasherServiceMock.compare.mockResolvedValue(false);
      accountLockoutServiceMock.registerFailure.mockResolvedValue(undefined);

      const validationPromise = service.validate(email, plainPassword);

      await expect(validationPromise).rejects.toMatchObject({
        message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      });

      expect(passwordHasherServiceMock.compare).toHaveBeenCalledWith(
        plainPassword,
        user.password,
      );

      expect(accountLockoutServiceMock.registerFailure).toHaveBeenCalledTimes(
        1,
      );

      expect(accountLockoutServiceMock.registerFailure).toHaveBeenCalledWith(
        user.id,
      );

      expect(accountLockoutServiceMock.reset).not.toHaveBeenCalled();
    });

    it('does not register a failure when the password is incorrect for an inactive user', async () => {
      const user = createUser({ isActive: false });

      usersServiceMock.findByEmail.mockResolvedValue(user);
      accountLockoutServiceMock.isLocked.mockResolvedValue(false);
      passwordHasherServiceMock.compare.mockResolvedValue(false);

      const validationPromise = service.validate(email, plainPassword);

      await expect(validationPromise).rejects.toMatchObject({
        message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      });

      expect(accountLockoutServiceMock.registerFailure).not.toHaveBeenCalled();

      expect(accountLockoutServiceMock.reset).not.toHaveBeenCalled();
    });

    it('throws invalid credentials when the user is inactive even if the password matches', async () => {
      const user = createUser({ isActive: false });

      usersServiceMock.findByEmail.mockResolvedValue(user);
      accountLockoutServiceMock.isLocked.mockResolvedValue(false);
      passwordHasherServiceMock.compare.mockResolvedValue(true);

      const validationPromise = service.validate(email, plainPassword);

      await expect(validationPromise).rejects.toMatchObject({
        message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      });

      expect(accountLockoutServiceMock.registerFailure).not.toHaveBeenCalled();

      expect(accountLockoutServiceMock.reset).not.toHaveBeenCalled();
    });

    it('resets previous login failures after successful validation', async () => {
      const user = createUser({
        failedLoginAttempts: 2,
        lastFailedLoginAt: new Date('2026-07-25T12:00:00.000Z'),
      });

      usersServiceMock.findByEmail.mockResolvedValue(user);
      accountLockoutServiceMock.isLocked.mockResolvedValue(false);
      passwordHasherServiceMock.compare.mockResolvedValue(true);
      accountLockoutServiceMock.reset.mockResolvedValue(undefined);

      const result = await service.validate(email, plainPassword);

      expect(accountLockoutServiceMock.reset).toHaveBeenCalledTimes(1);
      expect(accountLockoutServiceMock.reset).toHaveBeenCalledWith(user.id);

      expect(result).toBe(user);
    });

    it('resets login failures when lockedUntil is still stored', async () => {
      const user = createUser({
        lockedUntil: new Date('2026-07-25T12:00:00.000Z'),
      });

      usersServiceMock.findByEmail.mockResolvedValue(user);
      accountLockoutServiceMock.isLocked.mockResolvedValue(false);
      passwordHasherServiceMock.compare.mockResolvedValue(true);
      accountLockoutServiceMock.reset.mockResolvedValue(undefined);

      await service.validate(email, plainPassword);

      expect(accountLockoutServiceMock.reset).toHaveBeenCalledWith(user.id);
    });

    it('resets login failures when lastFailedLoginAt is still stored', async () => {
      const user = createUser({
        lastFailedLoginAt: new Date('2026-07-25T12:00:00.000Z'),
      });

      usersServiceMock.findByEmail.mockResolvedValue(user);
      accountLockoutServiceMock.isLocked.mockResolvedValue(false);
      passwordHasherServiceMock.compare.mockResolvedValue(true);
      accountLockoutServiceMock.reset.mockResolvedValue(undefined);

      await service.validate(email, plainPassword);

      expect(accountLockoutServiceMock.reset).toHaveBeenCalledWith(user.id);
    });
  });
});
