import { Injectable } from '@nestjs/common';

import { RefreshTokenRepository } from '../persistence/refresh-token/refresh-token.repository';
import {
  RefreshTokenRotationResult,
  RefreshTokenRotationStatus,
} from '../contracts/refresh-token-rotation.result';
import { RotateRefreshTokenInput } from '../persistence/refresh-token/inputs/rotate-refresh-token.input';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  rotate(input: RotateRefreshTokenInput): Promise<RefreshTokenRotationResult> {
    return this.refreshTokenRepository.withTransaction(async (transaction) => {
      const currentToken = await this.refreshTokenRepository.findForRotation(
        transaction,
        input.currentTokenHash,
      );

      if (!currentToken) {
        return {
          status: RefreshTokenRotationStatus.INVALID,
        };
      }

      const now = new Date();
      const { session } = currentToken;

      const invalidSession =
        session.revokedAt !== null ||
        session.expiresAt <= now ||
        !session.user.isActive ||
        session.user.deletedAt !== null;

      const invalidToken =
        currentToken.revokedAt !== null || currentToken.expiresAt <= now;

      if (invalidSession || invalidToken) {
        return {
          status: RefreshTokenRotationStatus.INVALID,
        };
      }

      if (currentToken.usedAt !== null) {
        await this.refreshTokenRepository.revokeFamily(
          transaction,
          session.id,
          now,
        );

        return {
          status: RefreshTokenRotationStatus.REUSE_DETECTED,
          sessionId: session.id,
          userId: session.userId,
        };
      }

      const consumed = await this.refreshTokenRepository.consume(
        transaction,
        currentToken.id,
        now,
      );

      if (!consumed) {
        await this.refreshTokenRepository.revokeFamily(
          transaction,
          session.id,
          now,
        );

        return {
          status: RefreshTokenRotationStatus.REUSE_DETECTED,
          sessionId: session.id,
          userId: session.userId,
        };
      }

      const newRefreshToken =
        await this.refreshTokenRepository.createReplacement(transaction, {
          sessionId: session.id,
          tokenHash: input.newTokenHash,
          expiresAt: session.expiresAt,
        });

      await this.refreshTokenRepository.linkReplacement(
        transaction,
        currentToken.id,
        newRefreshToken.id,
      );

      await this.refreshTokenRepository.touchSession(
        transaction,
        session.id,
        now,
      );

      return {
        status: RefreshTokenRotationStatus.ROTATED,
        sessionId: session.id,
        userId: session.userId,
        newRefreshTokenId: newRefreshToken.id,
      };
    });
  }
}
