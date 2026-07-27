import type { SessionRepository } from '@backend/modules/auth/persistence/session/session.repository';

export type SessionRepositoryMock = {
  createWithRefreshToken: jest.MockedFunction<
    SessionRepository['createWithRefreshToken']
  >;
  findForAuthorization: jest.MockedFunction<
    SessionRepository['findForAuthorization']
  >;
  revokeById: jest.MockedFunction<SessionRepository['revokeById']>;
  revokeAllByUserId: jest.MockedFunction<
    SessionRepository['revokeAllByUserId']
  >;
};

export const createSessionRepositoryMock = (): SessionRepositoryMock => ({
  createWithRefreshToken: jest.fn(),
  findForAuthorization: jest.fn(),
  revokeById: jest.fn(),
  revokeAllByUserId: jest.fn(),
});
