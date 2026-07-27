import { AccountLockoutService } from '@backend/modules/auth/services/account-lockout.service';

export type AccountLockoutServiceMock = {
  isLocked: jest.MockedFunction<AccountLockoutService['isLocked']>;
  registerFailure: jest.MockedFunction<
    AccountLockoutService['registerFailure']
  >;
  reset: jest.MockedFunction<AccountLockoutService['reset']>;
};

export const createAccountLockoutServiceMock =
  (): AccountLockoutServiceMock => ({
    isLocked: jest.fn(),
    registerFailure: jest.fn(),
    reset: jest.fn(),
  });
