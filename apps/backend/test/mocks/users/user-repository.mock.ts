import type { UserRepository } from '@backend/modules/users/persistence/user.repository';

export type UserRepositoryMock = {
  findRoleIdByName: jest.MockedFunction<UserRepository['findRoleIdByName']>;
  create: jest.MockedFunction<UserRepository['create']>;
  findAll: jest.MockedFunction<UserRepository['findAll']>;
  findById: jest.MockedFunction<UserRepository['findById']>;
  findAuthByEmail: jest.MockedFunction<UserRepository['findAuthByEmail']>;
  existsByEmail: jest.MockedFunction<UserRepository['existsByEmail']>;
  update: jest.MockedFunction<UserRepository['update']>;
  softDelete: jest.MockedFunction<UserRepository['softDelete']>;
  updateStatus: jest.MockedFunction<UserRepository['updateStatus']>;
  updatePassword: jest.MockedFunction<UserRepository['updatePassword']>;
  incrementFailedLoginAttempts: jest.MockedFunction<
    UserRepository['incrementFailedLoginAttempts']
  >;
  setLockedUntil: jest.MockedFunction<UserRepository['setLockedUntil']>;
  resetLoginFailures: jest.MockedFunction<UserRepository['resetLoginFailures']>;
};

export const createUserRepositoryMock = (): UserRepositoryMock => ({
  findRoleIdByName: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findAuthByEmail: jest.fn(),
  existsByEmail: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  updateStatus: jest.fn(),
  updatePassword: jest.fn(),
  incrementFailedLoginAttempts: jest.fn(),
  setLockedUntil: jest.fn(),
  resetLoginFailures: jest.fn(),
});
