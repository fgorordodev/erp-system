export type ConfigServiceMock = {
  get: jest.Mock<unknown, [propertyPath: string]>;
  getOrThrow: jest.Mock<unknown, [propertyPath: string]>;
};

export const createConfigServiceMock = (): ConfigServiceMock => ({
  get: jest.fn<unknown, [propertyPath: string]>(),
  getOrThrow: jest.fn<unknown, [propertyPath: string]>(),
});
