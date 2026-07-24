import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionService } from '../services/session.service';
import { AuthenticatedUser, JwtPayload } from '../../../security';

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

    const permissions =
      session.user.role?.permissions.map(({ permission }) => permission.name) ??
      [];

    return {
      userId: session.user.id,
      sessionId: session.id,
      email: session.user.email,
      permissions,
    };
  }
}
