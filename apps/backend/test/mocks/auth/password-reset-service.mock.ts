import type { PasswordResetService } from '@backend/modules/auth/services/password-reset.service';

export type PasswordResetServiceMock = {
  request: jest.MockedFunction<PasswordResetService['request']>;
  reset: jest.MockedFunction<PasswordResetService['reset']>;
};

export const createPasswordResetServiceMock = (): PasswordResetServiceMock => ({
  request: jest.fn(),
  reset: jest.fn(),
});
