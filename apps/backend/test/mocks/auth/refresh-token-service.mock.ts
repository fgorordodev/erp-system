import { RefreshTokenService } from '@backend/modules/auth/services/refresh-token.service';

export type RefreshTokenServiceMock = {
  rotate: jest.MockedFunction<RefreshTokenService['rotate']>;
};

export const createRefreshTokenServiceMock = (): RefreshTokenServiceMock => ({
  rotate: jest.fn(),
});
