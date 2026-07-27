import type { PasswordResetTokenRepository } from '@backend/modules/auth/persistence/password-reset-token/password-reset-token.repository';

export type PasswordResetTokenRepositoryMock = {
  withTransaction: jest.MockedFunction<
    PasswordResetTokenRepository['withTransaction']
  >;
  create: jest.MockedFunction<PasswordResetTokenRepository['create']>;
  findValidByHashForUpdate: jest.MockedFunction<
    PasswordResetTokenRepository['findValidByHashForUpdate']
  >;
  revokeActiveByUserId: jest.MockedFunction<
    PasswordResetTokenRepository['revokeActiveByUserId']
  >;
  consume: jest.MockedFunction<PasswordResetTokenRepository['consume']>;
  revokeOtherActiveTokens: jest.MockedFunction<
    PasswordResetTokenRepository['revokeOtherActiveTokens']
  >;
};

export const createPasswordResetTokenRepositoryMock =
  (): PasswordResetTokenRepositoryMock => ({
    withTransaction: jest.fn(),
    create: jest.fn(),
    findValidByHashForUpdate: jest.fn(),
    revokeActiveByUserId: jest.fn(),
    consume: jest.fn(),
    revokeOtherActiveTokens: jest.fn(),
  });
