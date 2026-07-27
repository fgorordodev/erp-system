import { JwtService } from '@nestjs/jwt';

export type JwtServiceMock = {
  signAsync: jest.MockedFunction<JwtService['signAsync']>;
  verifyAsync: jest.MockedFunction<JwtService['verifyAsync']>;
};

export const createJwtServiceMock = (): JwtServiceMock => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
});
