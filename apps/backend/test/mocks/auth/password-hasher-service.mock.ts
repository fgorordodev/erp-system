import type { PasswordHasherService } from '@backend/crypto';

export type PasswordHasherServiceMock = {
  hash: jest.MockedFunction<PasswordHasherService['hash']>;
  compare: jest.MockedFunction<PasswordHasherService['compare']>;
};

export const createPasswordHasherServiceMock =
  (): PasswordHasherServiceMock => ({
    hash: jest.fn(),
    compare: jest.fn(),
  });
