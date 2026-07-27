import type { AuthenticationService } from '@backend/modules/auth/services/authentication.service';

export type AuthenticationServiceMock = {
  login: jest.MockedFunction<AuthenticationService['login']>;
  refresh: jest.MockedFunction<AuthenticationService['refresh']>;
  logout: jest.MockedFunction<AuthenticationService['logout']>;
};

export const createAuthenticationServiceMock =
  (): AuthenticationServiceMock => ({
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  });
