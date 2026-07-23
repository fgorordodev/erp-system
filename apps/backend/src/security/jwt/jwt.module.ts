import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { PassportModule } from '@nestjs/passport';

import { DatabaseModule } from '../../database';

import { JwtService } from './jwt.service';

import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,

    DatabaseModule,

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),

        signOptions: {
          expiresIn: config.getOrThrow<'15m' | '1h'>('JWT_ACCESS_EXPIRES'),
        },
      }),
    }),
  ],

  providers: [JwtService, JwtStrategy],

  exports: [JwtService, JwtModule],
})
export class SecurityJwtModule {}
