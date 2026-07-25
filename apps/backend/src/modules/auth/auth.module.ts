import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CryptoModule } from '@backend/crypto';
import { DatabaseModule } from '@backend/database';

import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AccessTokenService } from './services/access-token.service';
import { PasswordResetService } from './services/password-reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthenticationService } from './services/authentication.service';
import { AccountLockoutService } from './services/account-lockout.service';
import { CredentialsService } from './services/credentials.service';
import { SessionService } from './services/session.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { PasswordResetNotificationService } from './services/password-reset-notification.service';
import { PasswordResetTokenService } from './services/password-reset-token.service';
import { UsersModule } from '../users';

console.log({
  ConfigModule,
  DatabaseModule,
  CryptoModule,
  UsersModule,
  PassportModule,
  JwtModule,
});

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CryptoModule,
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'JWT_ACCESS_EXPIRES',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthenticationService,
    AccountLockoutService,
    CredentialsService,
    SessionService,
    JwtStrategy,
    JwtAuthGuard,
    AccessTokenService,
    RefreshTokenService,
    PasswordResetService,
    PasswordResetNotificationService,
    PasswordResetTokenService,
  ],
  exports: [JwtAuthGuard, PassportModule],
})
export class AuthModule {}
