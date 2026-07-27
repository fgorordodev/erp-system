import { SecureTokenService } from '@backend/crypto';

export type SecureTokenServiceMock = {
  generate: jest.MockedFunction<SecureTokenService['generate']>;
  hash: jest.MockedFunction<SecureTokenService['hash']>;
};

export const createSecureTokenServiceMock = (): SecureTokenServiceMock => ({
  generate: jest.fn(),
  hash: jest.fn(),
});
