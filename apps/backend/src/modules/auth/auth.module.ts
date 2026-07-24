import { Module } from '@nestjs/common';

import { UsersModule } from '../users';
import { AuthController } from './auth.controller';
import {
  AuthenticationService,
  CredentialsService,
  RefreshTokenService,
  SessionService,
} from './services';
import { DatabaseModule } from '../../database';
import { JwtStrategy } from './strategies';
import { SecurityJwtModule } from '../../security';

@Module({
  imports: [DatabaseModule, SecurityJwtModule, UsersModule],
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
