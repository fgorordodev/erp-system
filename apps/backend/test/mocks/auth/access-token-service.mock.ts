import { AccessTokenService } from '@backend/modules/auth/services/access-token.service';

export type AccessTokenServiceMock = {
  generate: jest.MockedFunction<AccessTokenService['generate']>;
};

export const createAccessTokenServiceMock = (): AccessTokenServiceMock => ({
  generate: jest.fn(),
});
