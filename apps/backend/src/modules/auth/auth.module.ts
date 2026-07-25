import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CryptoModule } from '@backend/crypto';
import { DatabaseModule } from '@backend/database';
import { UsersModule } from '@backend/modules/users';

import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  AccountLockoutService,
  AuthenticationService,
  CredentialsService,
  PasswordResetNotificationService,
  PasswordResetTokenService,
  RefreshTokenService,
  SessionService,
} from './services';
import { AccessTokenService } from './services/access-token.service';
import { PasswordResetService } from './services/password-reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';

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
