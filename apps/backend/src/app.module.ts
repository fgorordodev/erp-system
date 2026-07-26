import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { throttlerConfig, validateEnv } from '@backend/config';
import { DatabaseModule } from '@backend/database';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  AuthorizationModule,
  PermissionsGuard,
  RolesGuard,
} from './modules/authorization';
import { AuthModule, JwtAuthGuard } from './modules/auth';
import { HealthModule } from './modules/health';
import { UsersModule } from './modules/users';
import {
  HttpExceptionFilter,
  LoggerModule,
  LoggingInterceptor,
  PrismaExceptionFilter,
  RequestIdMiddleware,
  ResponseInterceptor,
} from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync(throttlerConfig),
    LoggerModule,
    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AuthorizationModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
