import { RefreshTokenRepository } from '@backend/modules/auth/persistence/refresh-token/refresh-token.repository';

export type RefreshTokenRepositoryMock = {
  withTransaction: jest.MockedFunction<
    RefreshTokenRepository['withTransaction']
  >;

  findForRotation: jest.MockedFunction<
    RefreshTokenRepository['findForRotation']
  >;

  consume: jest.MockedFunction<RefreshTokenRepository['consume']>;

  createReplacement: jest.MockedFunction<
    RefreshTokenRepository['createReplacement']
  >;

  linkReplacement: jest.MockedFunction<
    RefreshTokenRepository['linkReplacement']
  >;

  touchSession: jest.MockedFunction<RefreshTokenRepository['touchSession']>;

  revokeFamily: jest.MockedFunction<RefreshTokenRepository['revokeFamily']>;
};

export const createRefreshTokenRepositoryMock =
  (): RefreshTokenRepositoryMock => ({
    withTransaction: jest.fn(),
    findForRotation: jest.fn(),
    consume: jest.fn(),
    createReplacement: jest.fn(),
    linkReplacement: jest.fn(),
    touchSession: jest.fn(),
    revokeFamily: jest.fn(),
  });
