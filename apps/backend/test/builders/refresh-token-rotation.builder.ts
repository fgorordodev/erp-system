import type { RefreshTokenRotationProjection } from '@backend/modules/auth/persistence/refresh-token/refresh-token.projection';

type RefreshTokenRotationOverrides = Partial<RefreshTokenRotationProjection>;

type SessionOverrides = Partial<RefreshTokenRotationProjection['session']>;

type UserOverrides = Partial<RefreshTokenRotationProjection['session']['user']>;

export class RefreshTokenRotationBuilder {
  private value: RefreshTokenRotationProjection;

  private constructor() {
    const now = new Date();

    this.value = {
      id: 'refresh-token-id',
      sessionId: 'session-id',
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      usedAt: null,
      revokedAt: null,
      session: {
        id: 'session-id',
        userId: 'user-id',
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
        revokedAt: null,
        user: {
          isActive: true,
          deletedAt: null,
        },
      },
    };
  }

  static valid(): RefreshTokenRotationBuilder {
    return new RefreshTokenRotationBuilder();
  }

  with(overrides: RefreshTokenRotationOverrides): RefreshTokenRotationBuilder {
    this.value = {
      ...this.value,
      ...overrides,
    };

    return this;
  }

  withSession(overrides: SessionOverrides): RefreshTokenRotationBuilder {
    this.value.session = {
      ...this.value.session,
      ...overrides,
    };

    return this;
  }

  withUser(overrides: UserOverrides): RefreshTokenRotationBuilder {
    this.value.session.user = {
      ...this.value.session.user,
      ...overrides,
    };

    return this;
  }

  used(usedAt: Date = new Date()): RefreshTokenRotationBuilder {
    this.value.usedAt = usedAt;

    return this;
  }

  revoked(revokedAt: Date = new Date()): RefreshTokenRotationBuilder {
    this.value.revokedAt = revokedAt;

    return this;
  }

  expired(referenceDate: Date = new Date()): RefreshTokenRotationBuilder {
    this.value.expiresAt = new Date(referenceDate.getTime() - 1);

    return this;
  }

  withRevokedSession(
    revokedAt: Date = new Date(),
  ): RefreshTokenRotationBuilder {
    this.value.session.revokedAt = revokedAt;

    return this;
  }

  withExpiredSession(
    referenceDate: Date = new Date(),
  ): RefreshTokenRotationBuilder {
    this.value.session.expiresAt = new Date(referenceDate.getTime() - 1);

    return this;
  }

  withInactiveUser(): RefreshTokenRotationBuilder {
    this.value.session.user.isActive = false;

    return this;
  }

  withDeletedUser(deletedAt: Date = new Date()): RefreshTokenRotationBuilder {
    this.value.session.user.deletedAt = deletedAt;

    return this;
  }

  build(): RefreshTokenRotationProjection {
    return structuredClone(this.value);
  }
}
