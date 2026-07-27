import { Test, type TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { createJwtServiceMock, type JwtServiceMock } from '@test/mocks';

import type { JwtPayload } from '../types/jwt-payload.type';
import { AccessTokenService } from './access-token.service';

describe('AccessTokenService', () => {
  let testingModule: TestingModule;
  let service: AccessTokenService;

  let jwtServiceMock: JwtServiceMock;

  const payload: JwtPayload = {
    sub: 'user-id',
    sessionId: 'session-id',
    email: 'user@example.com',
  };

  beforeEach(async () => {
    jwtServiceMock = createJwtServiceMock();

    testingModule = await Test.createTestingModule({
      providers: [
        AccessTokenService,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = testingModule.get(AccessTokenService);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.restoreAllMocks();
  });

  describe('generate', () => {
    it('returns the generated access token', async () => {
      jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

      const result = await service.generate(payload);

      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(1);
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(payload);

      expect(result).toBe('jwt-token');
    });

    it('propagates signing errors', async () => {
      const error = new Error('sign failed');

      jwtServiceMock.signAsync.mockRejectedValue(error);

      await expect(service.generate(payload)).rejects.toThrow(error);

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(payload);
    });
  });

  describe('verify', () => {
    it('returns the decoded payload', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue(payload);

      const result = await service.verify('jwt-token');

      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledTimes(1);
      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('jwt-token');

      expect(result).toEqual(payload);
    });

    it('propagates verification errors', async () => {
      const error = new Error('invalid token');

      jwtServiceMock.verifyAsync.mockRejectedValue(error);

      await expect(service.verify('jwt-token')).rejects.toThrow(error);

      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('jwt-token');
    });
  });
});
