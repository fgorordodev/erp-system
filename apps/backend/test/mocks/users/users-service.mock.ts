import { UsersService } from '@backend/modules/users';

export type UsersServiceMock = {
  create: jest.MockedFunction<UsersService['create']>;
  findAll: jest.MockedFunction<UsersService['findAll']>;
  findOne: jest.MockedFunction<UsersService['findOne']>;
  update: jest.MockedFunction<UsersService['update']>;
  updateStatus: jest.MockedFunction<UsersService['updateStatus']>;
  remove: jest.MockedFunction<UsersService['remove']>;

  findByEmail: jest.MockedFunction<UsersService['findByEmail']>;
  incrementFailedLoginAttempts: jest.MockedFunction<
    UsersService['incrementFailedLoginAttempts']
  >;
  setLockedUntil: jest.MockedFunction<UsersService['setLockedUntil']>;
  resetLoginFailures: jest.MockedFunction<UsersService['resetLoginFailures']>;
  updatePassword: jest.MockedFunction<UsersService['updatePassword']>;
};

export const createUsersServiceMock = (): UsersServiceMock => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  remove: jest.fn(),

  findByEmail: jest.fn(),
  incrementFailedLoginAttempts: jest.fn(),
  setLockedUntil: jest.fn(),
  resetLoginFailures: jest.fn(),
  updatePassword: jest.fn(),
});
