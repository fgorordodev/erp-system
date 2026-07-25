import { Module } from '@nestjs/common';

import { UsersModule } from '@backend/modules/users';
import {
  AccountLockoutService,
  AuthenticationService,
  CredentialsService,
  PasswordResetNotificationService,
  PasswordResetTokenService,
  RefreshTokenService,
  SessionService,
} from '@backend/modules/auth/services';
import { DatabaseModule } from '@backend/database';
import { JwtStrategy } from '@backend/modules/auth/strategies';
import { SecurityJwtModule } from '@backend/security/jwt';
import { AuthController } from './auth.controller';
import { PasswordResetService } from './services/password-reset.service';

@Module({
  imports: [DatabaseModule, SecurityJwtModule, UsersModule],
  controllers: [AuthController],
  providers: [
    AuthenticationService,
    AccountLockoutService,
    CredentialsService,
    SessionService,
    JwtStrategy,
    RefreshTokenService,
    PasswordResetService,
    PasswordResetNotificationService,
    PasswordResetTokenService,
  ],
})
export class AuthModule {}
