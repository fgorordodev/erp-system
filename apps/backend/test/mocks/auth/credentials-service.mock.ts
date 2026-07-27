import { CredentialsService } from '@backend/modules/auth/services/credentials.service';

export type CredentialsServiceMock = {
  validate: jest.MockedFunction<CredentialsService['validate']>;
};

export const createCredentialsServiceMock = (): CredentialsServiceMock => ({
  validate: jest.fn(),
});
