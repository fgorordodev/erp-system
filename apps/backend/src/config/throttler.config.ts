import type { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModule,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';

interface HttpRequest {
  method: string;
  url: string;
}

type ThrottlerAsyncConfig = Parameters<typeof ThrottlerModule.forRootAsync>[0];

function isRoute(
  context: ExecutionContext,
  method: string,
  route: string,
): boolean {
  const request = context.switchToHttp().getRequest<HttpRequest>();
  const pathname = request.url.split('?')[0];

  return request.method === method && pathname?.endsWith(route) === true;
}

function createThrottlerOptions(
  configService: ConfigService,
): ThrottlerModuleOptions {
  return [
    {
      name: 'default',
      ttl: configService.getOrThrow<number>('THROTTLE_TTL_MS'),
      limit: configService.getOrThrow<number>('THROTTLE_LIMIT'),
      skipIf: (context: ExecutionContext): boolean =>
        isRoute(context, 'POST', '/auth/login') ||
        isRoute(context, 'POST', '/auth/refresh'),
    },
    {
      name: 'login',
      ttl: configService.getOrThrow<number>('THROTTLE_LOGIN_TTL_MS'),
      limit: configService.getOrThrow<number>('THROTTLE_LOGIN_LIMIT'),
      skipIf: (context: ExecutionContext): boolean =>
        !isRoute(context, 'POST', '/auth/login'),
    },
    {
      name: 'refresh',
      ttl: configService.getOrThrow<number>('THROTTLE_REFRESH_TTL_MS'),
      limit: configService.getOrThrow<number>('THROTTLE_REFRESH_LIMIT'),
      skipIf: (context: ExecutionContext): boolean =>
        !isRoute(context, 'POST', '/auth/refresh'),
    },
  ];
}

export const throttlerConfig: ThrottlerAsyncConfig = {
  inject: [ConfigService],
  useFactory: createThrottlerOptions,
};
