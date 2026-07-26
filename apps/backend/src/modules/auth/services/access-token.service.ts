import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class AccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generate(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  verify(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token);
  }
}
