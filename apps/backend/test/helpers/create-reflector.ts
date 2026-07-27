import { Reflector } from '@nestjs/core';

export const createReflectorMock = () => {
  const getAllAndOverrideMock = jest.fn();

  const reflector = {
    getAllAndOverride: getAllAndOverrideMock,
  } as unknown as Reflector;

  return {
    reflector,
    getAllAndOverrideMock,
  };
};

export type ReflectorMock = ReturnType<typeof createReflectorMock>;
