import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { SessionMetadata } from '@backend/modules/auth/interfaces';

export const CurrentSessionMetadata = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionMetadata => {
    const request = context.switchToHttp().getRequest<Request>();

    const userAgent = request.headers['user-agent'];

    return {
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
      ipAddress: request.ip,
    };
  },
);
