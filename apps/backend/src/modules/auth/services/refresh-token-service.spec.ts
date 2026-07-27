import { Test, type TestingModule } from '@nestjs/testing';
import type { Prisma } from '@erp/database';

import {
  createRefreshTokenRepositoryMock,
  type RefreshTokenRepositoryMock,
} from '@test/mocks';

import {
  RefreshTokenRotationStatus,
  type RefreshTokenRotationResult,
} from '../contracts/refresh-token-rotation.result';
import { RefreshTokenRepository } from '../persistence/refresh-token/refresh-token.repository';
import type { RotateRefreshTokenInput } from '../persistence/refresh-token/inputs/rotate-refresh-token.input';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRotationBuilder } from '@test/builders/refresh-token-rotation.builder';

describe('RefreshTokenService', () => {
  let testingModule: TestingModule;
  let service: RefreshTokenService;
  let repositoryMock: RefreshTokenRepositoryMock;

  const transaction = {} as Prisma.TransactionClient;

  const input: RotateRefreshTokenInput = {
    currentTokenHash: 'current-token-hash',
    newTokenHash: 'new-token-hash',
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-27T12:00:00.000Z'));

    repositoryMock = createRefreshTokenRepositoryMock();

    repositoryMock.withTransaction.mockImplementation(
      async <T>(
        operation: (transaction: Prisma.TransactionClient) => Promise<T>,
      ): Promise<T> => operation(transaction),
    );

    testingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: RefreshTokenRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = testingModule.get(RefreshTokenService);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('rotate', () => {
    it('returns INVALID when the current token does not exist', async () => {
      repositoryMock.findForRotation.mockResolvedValue(null);

      const result = await service.rotate(input);

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.INVALID,
      });

      expect(repositoryMock.withTransaction).toHaveBeenCalledTimes(1);

      expect(repositoryMock.findForRotation).toHaveBeenCalledWith(
        transaction,
        input.currentTokenHash,
      );

      expect(repositoryMock.consume).not.toHaveBeenCalled();
      expect(repositoryMock.revokeFamily).not.toHaveBeenCalled();
      expect(repositoryMock.createReplacement).not.toHaveBeenCalled();
      expect(repositoryMock.linkReplacement).not.toHaveBeenCalled();
      expect(repositoryMock.touchSession).not.toHaveBeenCalled();
    });

    it('returns INVALID when the session is revoked', async () => {
      const currentToken = RefreshTokenRotationBuilder.valid()
        .withRevokedSession(new Date('2026-07-27T10:00:00.000Z'))
        .build();

      repositoryMock.findForRotation.mockResolvedValue(currentToken);

      const result = await service.rotate(input);

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.INVALID,
      });

      expect(repositoryMock.consume).not.toHaveBeenCalled();
      expect(repositoryMock.revokeFamily).not.toHaveBeenCalled();
      expect(repositoryMock.createReplacement).not.toHaveBeenCalled();
    });

    it('returns INVALID when the session is expired', async () => {
      const currentToken = RefreshTokenRotationBuilder.valid()
        .withExpiredSession(new Date('2026-07-27T12:00:00.000Z'))
        .build();

      repositoryMock.findForRotation.mockResolvedValue(currentToken);

      const result = await service.rotate(input);

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.INVALID,
      });

      expect(repositoryMock.consume).not.toHaveBeenCalled();
      expect(repositoryMock.revokeFamily).not.toHaveBeenCalled();
      expect(repositoryMock.createReplacement).not.toHaveBeenCalled();
    });

    it('returns INVALID when the user is inactive', async () => {
      const currentToken = RefreshTokenRotationBuilder.valid()
        .withInactiveUser()
        .build();

      repositoryMock.findForRotation.mockResolvedValue(currentToken);

      const result = await service.rotate(input);

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.INVALID,
      });

      expect(repositoryMock.consume).not.toHaveBeenCalled();
      expect(repositoryMock.revokeFamily).not.toHaveBeenCalled();
      expect(repositoryMock.createReplacement).not.toHaveBeenCalled();
    });

    it('returns INVALID when the user is deleted', async () => {
      const currentToken = RefreshTokenRotationBuilder.valid()
        .withDeletedUser(new Date('2026-07-26T12:00:00.000Z'))
        .build();

      repositoryMock.findForRotation.mockResolvedValue(currentToken);

      const result = await service.rotate(input);

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.INVALID,
      });

      expect(repositoryMock.consume).not.toHaveBeenCalled();
      expect(repositoryMock.revokeFamily).not.toHaveBeenCalled();
      expect(repositoryMock.createReplacement).not.toHaveBeenCalled();
    });

    it('returns INVALID when the current token is revoked', async () => {
      const currentToken = RefreshTokenRotationBuilder.valid()
        .revoked(new Date('2026-07-27T10:00:00.000Z'))
        .build();

      repositoryMock.findForRotation.mockResolvedValue(currentToken);

      const result = await service.rotate(input);

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.INVALID,
      });

      expect(repositoryMock.consume).not.toHaveBeenCalled();
      expect(repositoryMock.revokeFamily).not.toHaveBeenCalled();
      expect(repositoryMock.createReplacement).not.toHaveBeenCalled();
    });

    it('returns INVALID when the current token is expired', async () => {
      const currentToken = RefreshTokenRotationBuilder.valid()
        .expired(new Date('2026-07-27T12:00:00.000Z'))
        .build();

      repositoryMock.findForRotation.mockResolvedValue(currentToken);

      const result = await service.rotate(input);

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.INVALID,
      });

      expect(repositoryMock.consume).not.toHaveBeenCalled();
      expect(repositoryMock.revokeFamily).not.toHaveBeenCalled();
      expect(repositoryMock.createReplacement).not.toHaveBeenCalled();
    });

    it('revokes the token family and returns REUSE_DETECTED when the token was already used', async () => {
      const currentToken = RefreshTokenRotationBuilder.valid()
        .used(new Date('2026-07-27T11:00:00.000Z'))
        .build();

      repositoryMock.findForRotation.mockResolvedValue(currentToken);
      repositoryMock.revokeFamily.mockResolvedValue(undefined);

      const result = await service.rotate(input);

      expect(repositoryMock.revokeFamily).toHaveBeenCalledTimes(1);

      expect(repositoryMock.revokeFamily).toHaveBeenCalledWith(
        transaction,
        currentToken.session.id,
        new Date('2026-07-27T12:00:00.000Z'),
      );

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.REUSE_DETECTED,
        sessionId: currentToken.session.id,
        userId: currentToken.session.userId,
      });

      expect(repositoryMock.consume).not.toHaveBeenCalled();
      expect(repositoryMock.createReplacement).not.toHaveBeenCalled();
      expect(repositoryMock.linkReplacement).not.toHaveBeenCalled();
      expect(repositoryMock.touchSession).not.toHaveBeenCalled();
    });

    it('revokes the token family and returns REUSE_DETECTED when consuming the token fails', async () => {
      const currentToken = RefreshTokenRotationBuilder.valid().build();

      repositoryMock.findForRotation.mockResolvedValue(currentToken);
      repositoryMock.consume.mockResolvedValue(false);
      repositoryMock.revokeFamily.mockResolvedValue(undefined);

      const result = await service.rotate(input);

      const now = new Date('2026-07-27T12:00:00.000Z');

      expect(repositoryMock.consume).toHaveBeenCalledTimes(1);

      expect(repositoryMock.consume).toHaveBeenCalledWith(
        transaction,
        currentToken.id,
        now,
      );

      expect(repositoryMock.revokeFamily).toHaveBeenCalledWith(
        transaction,
        currentToken.session.id,
        now,
      );

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.REUSE_DETECTED,
        sessionId: currentToken.session.id,
        userId: currentToken.session.userId,
      });

      expect(repositoryMock.createReplacement).not.toHaveBeenCalled();
      expect(repositoryMock.linkReplacement).not.toHaveBeenCalled();
      expect(repositoryMock.touchSession).not.toHaveBeenCalled();
    });

    it('rotates the refresh token successfully', async () => {
      const currentToken = RefreshTokenRotationBuilder.valid().build();

      const newRefreshToken = {
        id: 'new-refresh-token-id',
      };

      repositoryMock.findForRotation.mockResolvedValue(currentToken);
      repositoryMock.consume.mockResolvedValue(true);
      repositoryMock.createReplacement.mockResolvedValue(newRefreshToken);
      repositoryMock.linkReplacement.mockResolvedValue(undefined);
      repositoryMock.touchSession.mockResolvedValue(undefined);

      const result: RefreshTokenRotationResult = await service.rotate(input);

      const now = new Date('2026-07-27T12:00:00.000Z');

      expect(repositoryMock.findForRotation).toHaveBeenCalledWith(
        transaction,
        input.currentTokenHash,
      );

      expect(repositoryMock.consume).toHaveBeenCalledWith(
        transaction,
        currentToken.id,
        now,
      );

      expect(repositoryMock.createReplacement).toHaveBeenCalledWith(
        transaction,
        {
          sessionId: currentToken.session.id,
          tokenHash: input.newTokenHash,
          expiresAt: currentToken.session.expiresAt,
        },
      );

      expect(repositoryMock.linkReplacement).toHaveBeenCalledWith(
        transaction,
        currentToken.id,
        newRefreshToken.id,
      );

      expect(repositoryMock.touchSession).toHaveBeenCalledWith(
        transaction,
        currentToken.session.id,
        now,
      );

      expect(repositoryMock.revokeFamily).not.toHaveBeenCalled();

      expect(result).toEqual({
        status: RefreshTokenRotationStatus.ROTATED,
        sessionId: currentToken.session.id,
        userId: currentToken.session.userId,
        newRefreshTokenId: newRefreshToken.id,
      });
    });
  });
});
