import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { SessionMetadata } from '../interfaces';

export const CurrentSessionMetadata = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionMetadata => {
    const request = context.switchToHttp().getRequest<Request>();

    const forwardedFor = request.headers['x-forwarded-for'];

    const ipAddress =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0]?.trim()
        : request.ip;

    return {
      userAgent: request.headers['user-agent'],
      ipAddress,
    };
  },
);
