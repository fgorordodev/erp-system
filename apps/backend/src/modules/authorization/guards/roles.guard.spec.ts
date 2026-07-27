import { IS_PUBLIC_KEY } from '@backend/modules/auth/decorators/public.decorator';
import {
  createAuthenticatedUser,
  createExecutionContext,
  createReflectorMock,
  type ReflectorMock,
} from '@test/helpers';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflectorMock: ReflectorMock;

  beforeEach(() => {
    reflectorMock = createReflectorMock();
    guard = new RolesGuard(reflectorMock.reflector);
  });

  it('allows access to public routes', () => {
    reflectorMock.getAllAndOverrideMock.mockImplementation(
      (metadataKey: unknown) => {
        if (metadataKey === IS_PUBLIC_KEY) {
          return true;
        }

        return undefined;
      },
    );

    const context = createExecutionContext({});

    expect(guard.canActivate(context)).toBe(true);
    expect(reflectorMock.getAllAndOverrideMock).toHaveBeenCalledTimes(1);
    expect(reflectorMock.getAllAndOverrideMock).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
  });

  it('allows access when no roles are required', () => {
    reflectorMock.getAllAndOverrideMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(undefined);

    const context = createExecutionContext({});

    expect(guard.canActivate(context)).toBe(true);
    expect(reflectorMock.getAllAndOverrideMock).toHaveBeenNthCalledWith(
      2,
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
  });

  it('allows access when the user has at least one required role', () => {
    reflectorMock.getAllAndOverrideMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['admin', 'manager']);

    const context = createExecutionContext({
      user: createAuthenticatedUser({
        roles: ['manager'],
      }),
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when the user has none of the required roles', () => {
    reflectorMock.getAllAndOverrideMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['admin', 'manager']);

    const context = createExecutionContext({
      user: createAuthenticatedUser({
        roles: ['employee'],
      }),
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('denies access when the request has no authenticated user', () => {
    reflectorMock.getAllAndOverrideMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['admin']);

    const context = createExecutionContext({});

    expect(guard.canActivate(context)).toBe(false);
  });
});
