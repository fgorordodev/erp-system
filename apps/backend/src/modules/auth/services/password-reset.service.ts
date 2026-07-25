import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorCode } from '@erp/api-contracts';

import { BusinessException } from '@backend/common';
import { PasswordHasherService, SecureTokenService } from '@backend/crypto';

import { UsersService } from '../../users/users.service';
import { AUTH_ERROR_MESSAGES } from '../constants';
import { ResetPasswordDto } from '../dto';
import { PasswordResetTokenRepository } from '../persistence/reset-password-token/password-reset-token.repository';
import { PasswordResetNotificationService } from './password-reset-notification.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasherService: PasswordHasherService,
    private readonly secureTokenService: SecureTokenService,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly notificationService: PasswordResetNotificationService,
    private readonly configService: ConfigService,
  ) {}

  async request(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(normalizedEmail);

    /*
     * Do not reveal whether the account exists.
     */
    if (!user || !user.isActive) {
      return;
    }

    const tokenBytes = this.configService.getOrThrow<number>(
      'AUTH_PASSWORD_RESET_TOKEN_BYTES',
    );

    const expiresInMs = this.configService.getOrThrow<number>(
      'AUTH_PASSWORD_RESET_EXPIRES_MS',
    );

    const token = this.secureTokenService.generate(tokenBytes);
    const tokenHash = this.secureTokenService.hash(token);
    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.passwordResetTokenRepository.revokeActiveByUserId(user.id);

    await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.notificationService.send({
      email: user.email,
      firstName: user.firstName,
      token,
    });
  }

  async reset(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = this.secureTokenService.hash(dto.token);
    const passwordHash = await this.passwordHasherService.hash(dto.password);
    const now = new Date();

    await this.passwordResetTokenRepository.withTransaction(
      async (transaction) => {
        const resetToken =
          await this.passwordResetTokenRepository.findValidByHashForUpdate(
            transaction,
            tokenHash,
            now,
          );

        if (!resetToken) {
          throw this.invalidPasswordResetTokenException();
        }

        const consumed = await this.passwordResetTokenRepository.consume(
          transaction,
          resetToken.id,
          now,
        );

        if (!consumed) {
          throw this.invalidPasswordResetTokenException();
        }

        await this.usersService.updatePassword(
          resetToken.userId,
          passwordHash,
          transaction,
        );

        await this.passwordResetTokenRepository.revokeOtherActiveTokens(
          transaction,
          resetToken.userId,
          resetToken.id,
          now,
        );

        await this.passwordResetTokenRepository.revokeAuthenticationSessions(
          transaction,
          resetToken.userId,
          now,
        );

        await this.passwordResetTokenRepository.resetAccountLockout(
          transaction,
          resetToken.userId,
        );
      },
    );
  }

  private invalidPasswordResetTokenException(): BusinessException {
    return new BusinessException(
      ErrorCode.INVALID_PASSWORD_RESET_TOKEN,
      AUTH_ERROR_MESSAGES.INVALID_PASSWORD_RESET_TOKEN,
      400,
    );
  }
}
