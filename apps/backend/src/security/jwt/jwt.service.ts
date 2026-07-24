import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtSignOptions, JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwt: NestJwtService,
    private readonly config: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): Promise<string> {
    const expiresIn = this.config.getOrThrow<string>(
      'JWT_ACCESS_EXPIRES',
    ) as JwtSignOptions['expiresIn'];

    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn,
    });
  }

  verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync<JwtPayload>(token, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }
}
