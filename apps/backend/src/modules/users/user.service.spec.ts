import { Test, type TestingModule } from '@nestjs/testing';

import type { Prisma } from '@erp/database';
import { ROLES } from '@erp/rbac';

import { BusinessException } from '@backend/common';
import { PasswordHasherService } from '@backend/crypto';

import {
  createPasswordHasherServiceMock,
  createUserRepositoryMock,
  type PasswordHasherServiceMock,
  type UserRepositoryMock,
} from '@test/mocks';

import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type {
  UserAuthProjection,
  UserResponseProjection,
} from './persistence/user.projection';
import { UserRepository } from './persistence/user.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let testingModule: TestingModule;
  let service: UsersService;

  let userRepositoryMock: UserRepositoryMock;
  let passwordHasherServiceMock: PasswordHasherServiceMock;

  const transaction = {} as Pick<Prisma.TransactionClient, 'user'>;

  const createdAt = new Date('2026-07-22T21:00:00.000Z');
  const updatedAt = new Date('2026-07-23T18:00:00.000Z');

  const createUserProjection = (
    overrides: Partial<UserResponseProjection> = {},
  ): UserResponseProjection => ({
    id: 'user-id',
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    roles: [
      {
        role: {
          name: ROLES.EMPLOYEE,
        },
      },
    ],
    createdAt,
    updatedAt,
    ...overrides,
  });

  const createAuthProjection = (
    overrides: Partial<UserAuthProjection> = {},
  ): UserAuthProjection => ({
    id: 'user-id',
    email: 'user@example.com',
    password: 'password-hash',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    deletedAt: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastFailedLoginAt: null,
    createdAt,
    updatedAt,
    roles: [
      {
        role: {
          id: 'employee-role-id',
          name: ROLES.EMPLOYEE,
          permissions: [],
        },
      },
    ],
    ...overrides,
  });

  beforeEach(async () => {
    userRepositoryMock = createUserRepositoryMock();
    passwordHasherServiceMock = createPasswordHasherServiceMock();

    testingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: PasswordHasherService,
          useValue: passwordHasherServiceMock,
        },
      ],
    }).compile();

    service = testingModule.get(UsersService);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.restoreAllMocks();
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      email: '  USER@Example.COM  ',
      password: 'Password123!',
      firstName: '  Test  ',
      lastName: '  User  ',
    };

    it('creates a user with normalized data and the default role', async () => {
      const passwordHash = 'hashed-password';
      const roleId = 'employee-role-id';
      const user = createUserProjection();

      userRepositoryMock.existsByEmail.mockResolvedValue(false);
      userRepositoryMock.findRoleIdByName.mockResolvedValue(roleId);
      passwordHasherServiceMock.hash.mockResolvedValue(passwordHash);
      userRepositoryMock.create.mockResolvedValue(user);

      const result = await service.create(dto);

      expect(userRepositoryMock.existsByEmail).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.existsByEmail).toHaveBeenCalledWith(
        'user@example.com',
        undefined,
      );

      expect(userRepositoryMock.findRoleIdByName).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.findRoleIdByName).toHaveBeenCalledWith(
        ROLES.EMPLOYEE,
      );

      expect(passwordHasherServiceMock.hash).toHaveBeenCalledTimes(1);
      expect(passwordHasherServiceMock.hash).toHaveBeenCalledWith(dto.password);

      expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.create).toHaveBeenCalledWith({
        email: 'user@example.com',
        passwordHash,
        firstName: 'Test',
        lastName: 'User',
        roleId,
      });

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: [{ name: ROLES.EMPLOYEE }],
        createdAt,
        updatedAt,
      });
    });

    it('throws when the email is already registered', async () => {
      userRepositoryMock.existsByEmail.mockResolvedValue(true);

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        BusinessException,
      );

      expect(userRepositoryMock.existsByEmail).toHaveBeenCalledWith(
        'user@example.com',
        undefined,
      );

      expect(userRepositoryMock.findRoleIdByName).not.toHaveBeenCalled();
      expect(passwordHasherServiceMock.hash).not.toHaveBeenCalled();
      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('throws when the default role does not exist', async () => {
      userRepositoryMock.existsByEmail.mockResolvedValue(false);
      userRepositoryMock.findRoleIdByName.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        BusinessException,
      );

      expect(userRepositoryMock.findRoleIdByName).toHaveBeenCalledWith(
        ROLES.EMPLOYEE,
      );

      expect(passwordHasherServiceMock.hash).not.toHaveBeenCalled();
      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('validates the email and role before hashing and creating', async () => {
      const callOrder: string[] = [];

      userRepositoryMock.existsByEmail.mockImplementation(() => {
        callOrder.push('validate-email');

        return Promise.resolve(false);
      });

      userRepositoryMock.findRoleIdByName.mockImplementation(() => {
        callOrder.push('find-role');

        return Promise.resolve('employee-role-id');
      });

      passwordHasherServiceMock.hash.mockImplementation(() => {
        callOrder.push('hash-password');

        return Promise.resolve('password-hash');
      });

      userRepositoryMock.create.mockImplementation(() => {
        callOrder.push('create-user');

        return Promise.resolve(createUserProjection());
      });

      await service.create(dto);

      expect(callOrder).toEqual([
        'validate-email',
        'find-role',
        'hash-password',
        'create-user',
      ]);
    });
  });

  describe('findAll', () => {
    it('returns all users mapped to response DTOs', async () => {
      const users: UserResponseProjection[] = [
        createUserProjection(),
        createUserProjection({
          id: 'admin-user-id',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          isActive: false,
          roles: [
            {
              role: {
                name: ROLES.ADMIN,
              },
            },
          ],
        }),
      ];

      userRepositoryMock.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(userRepositoryMock.findAll).toHaveBeenCalledTimes(1);

      expect(result).toEqual([
        {
          id: 'user-id',
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          roles: [{ name: ROLES.EMPLOYEE }],
          createdAt,
          updatedAt,
        },
        {
          id: 'admin-user-id',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          isActive: false,
          roles: [{ name: ROLES.ADMIN }],
          createdAt,
          updatedAt,
        },
      ]);
    });

    it('returns an empty array when no users exist', async () => {
      userRepositoryMock.findAll.mockResolvedValue([]);

      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns the requested user mapped to a response DTO', async () => {
      const user = createUserProjection();

      userRepositoryMock.findById.mockResolvedValue(user);

      const result = await service.findOne(user.id);

      expect(userRepositoryMock.findById).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(user.id);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: [{ name: ROLES.EMPLOYEE }],
        createdAt,
        updatedAt,
      });
    });

    it('throws when the user does not exist', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(service.findOne('missing-user-id')).rejects.toBeInstanceOf(
        BusinessException,
      );
    });
  });

  describe('findByEmail', () => {
    it('returns the authentication projection from the repository', async () => {
      const user = createAuthProjection();

      userRepositoryMock.findAuthByEmail.mockResolvedValue(user);

      await expect(service.findByEmail('USER@Example.com')).resolves.toEqual(
        user,
      );

      expect(userRepositoryMock.findAuthByEmail).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.findAuthByEmail).toHaveBeenCalledWith(
        'USER@Example.com',
      );
    });

    it('returns null when the email does not belong to a user', async () => {
      userRepositoryMock.findAuthByEmail.mockResolvedValue(null);

      await expect(
        service.findByEmail('missing@example.com'),
      ).resolves.toBeNull();
    });
  });

  describe('update', () => {
    it('normalizes and updates every supplied field', async () => {
      const dto: UpdateUserDto = {
        email: '  UPDATED@Example.COM  ',
        firstName: '  Updated  ',
        lastName: '  User  ',
      };

      const existingUser = createUserProjection();
      const updatedUser = createUserProjection({
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
      });

      userRepositoryMock.findById.mockResolvedValue(existingUser);
      userRepositoryMock.existsByEmail.mockResolvedValue(false);
      userRepositoryMock.update.mockResolvedValue(updatedUser);

      const result = await service.update(existingUser.id, dto);

      expect(userRepositoryMock.findById).toHaveBeenCalledWith(existingUser.id);

      expect(userRepositoryMock.existsByEmail).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.existsByEmail).toHaveBeenCalledWith(
        'updated@example.com',
        existingUser.id,
      );

      expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(existingUser.id, {
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
      });

      expect(result).toEqual({
        id: updatedUser.id,
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
        isActive: updatedUser.isActive,
        roles: [{ name: ROLES.EMPLOYEE }],
        createdAt,
        updatedAt,
      });
    });

    it('updates only the supplied fields', async () => {
      const existingUser = createUserProjection();
      const updatedUser = createUserProjection({
        firstName: 'Updated',
      });

      userRepositoryMock.findById.mockResolvedValue(existingUser);
      userRepositoryMock.update.mockResolvedValue(updatedUser);

      await service.update(existingUser.id, {
        firstName: '  Updated  ',
      });

      expect(userRepositoryMock.existsByEmail).not.toHaveBeenCalled();

      expect(userRepositoryMock.update).toHaveBeenCalledWith(existingUser.id, {
        firstName: 'Updated',
      });
    });

    it('supports an empty partial update', async () => {
      const user = createUserProjection();

      userRepositoryMock.findById.mockResolvedValue(user);
      userRepositoryMock.update.mockResolvedValue(user);

      await service.update(user.id, {});

      expect(userRepositoryMock.existsByEmail).not.toHaveBeenCalled();
      expect(userRepositoryMock.update).toHaveBeenCalledWith(user.id, {});
    });

    it('throws when the user does not exist', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.update('missing-user-id', {
          firstName: 'Updated',
        }),
      ).rejects.toBeInstanceOf(BusinessException);

      expect(userRepositoryMock.existsByEmail).not.toHaveBeenCalled();
      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('throws when another user already owns the new email', async () => {
      const user = createUserProjection();

      userRepositoryMock.findById.mockResolvedValue(user);
      userRepositoryMock.existsByEmail.mockResolvedValue(true);

      await expect(
        service.update(user.id, {
          email: '  REGISTERED@Example.COM  ',
        }),
      ).rejects.toBeInstanceOf(BusinessException);

      expect(userRepositoryMock.existsByEmail).toHaveBeenCalledWith(
        'registered@example.com',
        user.id,
      );

      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('soft-deletes an existing user', async () => {
      const existingUser = createUserProjection();
      const deletedUser = createUserProjection({
        isActive: false,
      });

      userRepositoryMock.findById.mockResolvedValue(existingUser);
      userRepositoryMock.softDelete.mockResolvedValue(deletedUser);

      const result = await service.remove(existingUser.id);

      expect(userRepositoryMock.findById).toHaveBeenCalledWith(existingUser.id);
      expect(userRepositoryMock.softDelete).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.softDelete).toHaveBeenCalledWith(
        existingUser.id,
      );

      expect(result.isActive).toBe(false);
    });

    it('throws when the user does not exist', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(service.remove('missing-user-id')).rejects.toBeInstanceOf(
        BusinessException,
      );

      expect(userRepositoryMock.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it.each([true, false])(
      'updates the active status to %s',
      async (isActive) => {
        const existingUser = createUserProjection();
        const updatedUser = createUserProjection({
          isActive,
        });

        userRepositoryMock.findById.mockResolvedValue(existingUser);
        userRepositoryMock.updateStatus.mockResolvedValue(updatedUser);

        const result = await service.updateStatus(existingUser.id, isActive);

        expect(userRepositoryMock.findById).toHaveBeenCalledWith(
          existingUser.id,
        );

        expect(userRepositoryMock.updateStatus).toHaveBeenCalledWith(
          existingUser.id,
          isActive,
        );

        expect(result.isActive).toBe(isActive);
      },
    );

    it('throws when the user does not exist', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus('missing-user-id', false),
      ).rejects.toBeInstanceOf(BusinessException);

      expect(userRepositoryMock.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('returns the mapped user when found', async () => {
      const user = createUserProjection();

      userRepositoryMock.findById.mockResolvedValue(user);

      const result = await service.findById(user.id);

      expect(userRepositoryMock.findById).toHaveBeenCalledWith(user.id);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: [{ name: ROLES.EMPLOYEE }],
        createdAt,
        updatedAt,
      });
    });

    it('returns null when the user does not exist', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(service.findById('missing-user-id')).resolves.toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('delegates without an explicit database client', async () => {
      userRepositoryMock.updatePassword.mockResolvedValue(undefined);

      await service.updatePassword('user-id', 'new-password-hash');

      expect(userRepositoryMock.updatePassword).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.updatePassword).toHaveBeenCalledWith(
        'user-id',
        'new-password-hash',
        undefined,
      );
    });

    it('forwards the provided database client', async () => {
      userRepositoryMock.updatePassword.mockResolvedValue(undefined);

      await service.updatePassword('user-id', 'new-password-hash', transaction);

      expect(userRepositoryMock.updatePassword).toHaveBeenCalledWith(
        'user-id',
        'new-password-hash',
        transaction,
      );
    });
  });

  describe('incrementFailedLoginAttempts', () => {
    const failedAt = new Date('2026-07-27T12:00:00.000Z');

    it('delegates without an explicit database client', async () => {
      userRepositoryMock.incrementFailedLoginAttempts.mockResolvedValue({
        failedLoginAttempts: 1,
      });

      const result = await service.incrementFailedLoginAttempts(
        'user-id',
        failedAt,
      );

      expect(
        userRepositoryMock.incrementFailedLoginAttempts,
      ).toHaveBeenCalledWith('user-id', failedAt);

      expect(result).toEqual({
        failedLoginAttempts: 1,
      });
    });

    it('forwards the provided database client', async () => {
      userRepositoryMock.incrementFailedLoginAttempts.mockResolvedValue({
        failedLoginAttempts: 2,
      });

      const result = await service.incrementFailedLoginAttempts(
        'user-id',
        failedAt,
        transaction,
      );

      expect(
        userRepositoryMock.incrementFailedLoginAttempts,
      ).toHaveBeenCalledWith('user-id', failedAt, transaction);

      expect(result).toEqual({
        failedLoginAttempts: 2,
      });
    });
  });

  describe('setLockedUntil', () => {
    const lockedUntil = new Date('2026-07-27T12:15:00.000Z');

    it('delegates without an explicit database client', async () => {
      userRepositoryMock.setLockedUntil.mockResolvedValue(undefined);

      await service.setLockedUntil('user-id', lockedUntil);

      expect(userRepositoryMock.setLockedUntil).toHaveBeenCalledWith(
        'user-id',
        lockedUntil,
      );
    });

    it('forwards the provided database client', async () => {
      userRepositoryMock.setLockedUntil.mockResolvedValue(undefined);

      await service.setLockedUntil('user-id', lockedUntil, transaction);

      expect(userRepositoryMock.setLockedUntil).toHaveBeenCalledWith(
        'user-id',
        lockedUntil,
        transaction,
      );
    });
  });

  describe('resetLoginFailures', () => {
    it('delegates without an explicit database client', async () => {
      userRepositoryMock.resetLoginFailures.mockResolvedValue(undefined);

      await service.resetLoginFailures('user-id');

      expect(userRepositoryMock.resetLoginFailures).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.resetLoginFailures).toHaveBeenCalledWith(
        'user-id',
      );
    });

    it('forwards the provided database client', async () => {
      userRepositoryMock.resetLoginFailures.mockResolvedValue(undefined);

      await service.resetLoginFailures('user-id', transaction);

      expect(userRepositoryMock.resetLoginFailures).toHaveBeenCalledWith(
        'user-id',
        transaction,
      );
    });
  });
});
