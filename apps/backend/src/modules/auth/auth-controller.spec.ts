import { Test, type TestingModule } from '@nestjs/testing';

import {
  createAuthenticationServiceMock,
  createPasswordResetServiceMock,
  type AuthenticationServiceMock,
  type PasswordResetServiceMock,
} from '@test/mocks';

import { AuthController } from './auth.controller';
import type { SessionMetadata } from './contracts/session-metadata';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { LoginResponseDto } from './dto/login-response.dto';
import type { RefreshDto } from './dto/refresh.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';
import type { TokenPairResponseDto } from './dto/token-pair-response.dto';
import { AuthenticationService } from './services/authentication.service';
import { PasswordResetService } from './services/password-reset.service';
import type { AuthenticatedUser } from './types/authenticated-user.type';

describe('AuthController', () => {
  let testingModule: TestingModule;
  let controller: AuthController;

  let authenticationServiceMock: AuthenticationServiceMock;
  let passwordResetServiceMock: PasswordResetServiceMock;

  beforeEach(async () => {
    authenticationServiceMock = createAuthenticationServiceMock();
    passwordResetServiceMock = createPasswordResetServiceMock();

    testingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: authenticationServiceMock,
        },
        {
          provide: PasswordResetService,
          useValue: passwordResetServiceMock,
        },
      ],
    }).compile();

    controller = testingModule.get(AuthController);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it('delegates authentication to AuthenticationService', async () => {
      const dto: LoginDto = {
        email: 'user@example.com',
        password: 'StrongPassword123!',
        rememberMe: true,
      };

      const metadata: SessionMetadata = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      const response: LoginResponseDto = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        user: {
          id: 'user-id',
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          roles: [{ name: 'EMPLOYEE' }],
          createdAt: new Date('2026-07-22T21:00:00.000Z'),
          updatedAt: new Date('2026-07-23T18:00:00.000Z'),
        },
      };

      authenticationServiceMock.login.mockResolvedValue(response);

      await expect(controller.login(dto, metadata)).resolves.toEqual(response);

      expect(authenticationServiceMock.login).toHaveBeenCalledTimes(1);
      expect(authenticationServiceMock.login).toHaveBeenCalledWith(
        dto,
        metadata,
      );
    });
  });

  describe('refresh', () => {
    it('delegates token rotation to AuthenticationService', async () => {
      const dto: RefreshDto = {
        refreshToken: 'a'.repeat(32),
      };

      const response: TokenPairResponseDto = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      };

      authenticationServiceMock.refresh.mockResolvedValue(response);

      await expect(controller.refresh(dto)).resolves.toEqual(response);

      expect(authenticationServiceMock.refresh).toHaveBeenCalledTimes(1);
      expect(authenticationServiceMock.refresh).toHaveBeenCalledWith(dto);
    });
  });

  describe('logout', () => {
    it('revokes the current session', async () => {
      const user: AuthenticatedUser = {
        userId: 'user-id',
        sessionId: 'session-id',
        email: 'user@example.com',
        roles: ['EMPLOYEE'],
        permissions: ['profile.read'],
      };

      authenticationServiceMock.logout.mockResolvedValue(undefined);

      await expect(controller.logout(user)).resolves.toBeUndefined();

      expect(authenticationServiceMock.logout).toHaveBeenCalledTimes(1);
      expect(authenticationServiceMock.logout).toHaveBeenCalledWith(
        'session-id',
      );
    });
  });

  describe('resetPassword', () => {
    it('delegates password reset to PasswordResetService', async () => {
      const dto: ResetPasswordDto = {
        token: 'reset-token',
        password: 'NewPassword123!',
      };

      passwordResetServiceMock.reset.mockResolvedValue(undefined);

      await expect(controller.resetPassword(dto)).resolves.toBeUndefined();

      expect(passwordResetServiceMock.reset).toHaveBeenCalledTimes(1);
      expect(passwordResetServiceMock.reset).toHaveBeenCalledWith(dto);
    });
  });

  describe('forgotPassword', () => {
    it('delegates password reset request to PasswordResetService', async () => {
      const dto: ForgotPasswordDto = {
        email: 'user@example.com',
      };

      passwordResetServiceMock.request.mockResolvedValue(undefined);

      await expect(controller.forgotPassword(dto)).resolves.toBeUndefined();

      expect(passwordResetServiceMock.request).toHaveBeenCalledTimes(1);
      expect(passwordResetServiceMock.request).toHaveBeenCalledWith(
        'user@example.com',
      );
    });
  });
});
