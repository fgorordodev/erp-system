import type { PasswordResetNotificationService } from '@backend/modules/auth/services/password-reset-notification.service';

export type PasswordResetNotificationServiceMock = {
  send: jest.MockedFunction<PasswordResetNotificationService['send']>;
};

export const createPasswordResetNotificationServiceMock =
  (): PasswordResetNotificationServiceMock => ({
    send: jest.fn(),
  });
