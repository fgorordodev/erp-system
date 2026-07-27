import type { SessionRepository } from '@backend/modules/auth/persistence/session/session.repository';

type AuthorizationSession = NonNullable<
  Awaited<ReturnType<SessionRepository['findForAuthorization']>>
>;

type AuthorizationRole = AuthorizationSession['user']['roles'][number];

export class AuthorizationSessionBuilder {
  private value: AuthorizationSession;

  constructor() {
    this.value = {
      id: 'session-id',
      userId: 'user-id',
      expiresAt: new Date('2099-12-31T23:59:59.000Z'),
      revokedAt: null,
      user: {
        id: 'user-id',
        email: 'user@example.com',
        deletedAt: null,
        isActive: true,
        roles: [],
      },
    };
  }

  withId(id: string): this {
    this.value.id = id;

    return this;
  }

  withUserId(userId: string): this {
    this.value.userId = userId;
    this.value.user.id = userId;

    return this;
  }

  withEmail(email: string): this {
    this.value.user.email = email;

    return this;
  }

  withExpiration(expiresAt: Date): this {
    this.value.expiresAt = expiresAt;

    return this;
  }

  revokedAt(revokedAt: Date): this {
    this.value.revokedAt = revokedAt;

    return this;
  }

  withInactiveUser(): this {
    this.value.user.isActive = false;

    return this;
  }

  withDeletedUser(deletedAt = new Date()): this {
    this.value.user.deletedAt = deletedAt;

    return this;
  }

  withRole(name: string, permissions: string[] = []): this {
    const role: AuthorizationRole = {
      role: {
        name,
        permissions: permissions.map((permissionName) => ({
          permission: {
            name: permissionName,
          },
        })),
      },
    };

    this.value.user.roles = [...this.value.user.roles, role];

    return this;
  }

  withoutRoles(): this {
    this.value.user.roles = [];

    return this;
  }

  build(): AuthorizationSession {
    return structuredClone(this.value);
  }
}
