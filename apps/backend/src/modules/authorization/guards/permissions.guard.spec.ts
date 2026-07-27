import {
  createAuthenticatedUser,
  createExecutionContext,
  createReflectorMock,
  type ReflectorMock,
} from '@test/helpers';
import { ForbiddenException } from '@nestjs/common';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflectorMock: ReflectorMock;

  beforeEach(() => {
    reflectorMock = createReflectorMock();
    guard = new PermissionsGuard(reflectorMock.reflector);
  });

  it('allows access when no permissions are required', () => {
    reflectorMock.getAllAndOverrideMock.mockReturnValue(undefined);

    const context = createExecutionContext({});

    expect(guard.canActivate(context)).toBe(true);
    expect(reflectorMock.getAllAndOverrideMock).toHaveBeenCalledWith(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
  });

  it('allows access when the user has every required permission', () => {
    reflectorMock.getAllAndOverrideMock.mockReturnValue([
      'users.read',
      'users.update',
    ]);

    const context = createExecutionContext({
      user: createAuthenticatedUser({
        permissions: ['users.read', 'users.update'],
      }),
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws when the user is missing a required permission', () => {
    reflectorMock.getAllAndOverrideMock.mockReturnValue([
      'users.read',
      'users.update',
    ]);

    const context = createExecutionContext({
      user: createAuthenticatedUser({
        permissions: ['users.read'],
      }),
    });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException(
        'You do not have permission to perform this action',
      ),
    );
  });

  it('throws when the request has no authenticated user', () => {
    reflectorMock.getAllAndOverrideMock.mockReturnValue(['users.read']);

    const context = createExecutionContext({});

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException(
        'You do not have permission to perform this action',
      ),
    );
  });
});
