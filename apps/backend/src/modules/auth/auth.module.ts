import { Module } from '@nestjs/common';

import { UsersModule } from '@backend/modules/users';
import {
  AuthenticationService,
  CredentialsService,
  RefreshTokenService,
  SessionService,
} from '@backend/modules/auth/services';
import { PrismaModule } from '@backend/database';
import { JwtStrategy } from '@backend/modules/auth/strategies';
import { SecurityJwtModule } from '@backend/security/jwt';
import { AuthController } from './auth.controller';

@Module({
  imports: [PrismaModule, SecurityJwtModule, UsersModule],
  controllers: [AuthController],
  providers: [
    AuthenticationService,
    CredentialsService,
    SessionService,
    JwtStrategy,
    RefreshTokenService,
  ],
})
export class AuthModule {}
