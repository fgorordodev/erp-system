import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { validateEnv } from './config';
import { LoggerModule, RequestIdMiddleware } from './common';
import { HealthModule, UsersModule } from './modules';
import { DatabaseModule } from './database';
import { SecurityModule } from './security/security.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from './security';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validate: validateEnv,
    }),
    HealthModule,
    DatabaseModule,
    LoggerModule,
    UsersModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
