import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AuthenticatedUser } from '@backend/security/jwt/interfaces';
import type { JwtPayload } from '@backend/security/jwt/interfaces';
import { SessionService } from '@backend/modules/auth/services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub || !payload.sessionId) {
      throw new UnauthorizedException();
    }

    const session = await this.sessionService.findForAuthorization(
      payload.sessionId,
      payload.sub,
    );

    if (!session) {
      throw new UnauthorizedException();
    }

    const roles = session.user.roles.map(({ role }) => role.name);
    const permissions = [
      ...new Set(
        session.user.roles.flatMap(({ role }) =>
          role.permissions.map(({ permission }) => permission.name),
        ),
      ),
    ];

    return {
      userId: session.user.id,
      sessionId: session.id,
      email: session.user.email,
      roles,
      permissions,
    };
  }
}
