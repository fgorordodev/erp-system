import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BusinessException } from '@backend/common';
import { PrismaService } from '@backend/database';
import { HashService } from '@backend/security';
import { TokenService } from '@backend/security/token';
import { UsersService } from '@backend/modules/users';
import { ErrorCode } from '@erp/api-contracts';

import { AUTH_ERROR_MESSAGES } from '../constants';
import { ResetPasswordDto } from '../dto';
import { PasswordResetNotificationService } from './password-reset-notification.service';
import { PasswordResetTokenService } from './password-reset-token.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly passwordResetTokenService: PasswordResetTokenService,
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

    const token = this.tokenService.generate(tokenBytes);
    const tokenHash = this.tokenService.hash(token);
    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.passwordResetTokenService.revokeActiveByUserId(user.id);

    await this.passwordResetTokenService.create({
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
    const tokenHash = this.tokenService.hash(dto.token);
    const passwordHash = await this.hashService.hash(dto.password);
    const now = new Date();

    await this.prisma.$transaction(async (transaction) => {
      const resetToken = await transaction.passwordResetToken.findFirst({
        where: {
          tokenHash,
          usedAt: null,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
          user: {
            isActive: true,
            deletedAt: null,
          },
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!resetToken) {
        throw this.invalidPasswordResetTokenException();
      }

      const consumedToken = await transaction.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

      if (consumedToken.count !== 1) {
        throw this.invalidPasswordResetTokenException();
      }

      await this.usersService.updatePassword(
        resetToken.userId,
        passwordHash,
        transaction,
      );

      await transaction.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          id: {
            not: resetToken.id,
          },
          usedAt: null,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });

      await transaction.refreshToken.updateMany({
        where: {
          session: {
            userId: resetToken.userId,
          },
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });

      await transaction.session.updateMany({
        where: {
          userId: resetToken.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });

      await transaction.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastFailedLoginAt: null,
        },
      });
    });
  }

  private invalidPasswordResetTokenException(): BusinessException {
    return new BusinessException(
      ErrorCode.INVALID_PASSWORD_RESET_TOKEN,
      AUTH_ERROR_MESSAGES.INVALID_PASSWORD_RESET_TOKEN,
      400,
    );
  }
}
