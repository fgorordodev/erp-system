import type { ExecutionContext } from '@nestjs/common';

export const createExecutionContext = <TRequest extends object>(
  request: TRequest,
): ExecutionContext => {
  const handler = (): void => undefined;
  const controller = class TestController {};

  return {
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: <T>() => request as unknown as T,
      getResponse: () => undefined,
      getNext: () => undefined,
    }),
  } as unknown as ExecutionContext;
};
