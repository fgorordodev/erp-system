import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { Request, Response } from 'express';

import { ErrorCode } from '../exceptions/error.codes';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let code = ErrorCode.INTERNAL_ERROR;

    let message = 'Database error';

    switch (exception.code) {
      /**
       * Unique constraint
       * Ej: email duplicado
       */
      case 'P2002':
        status = HttpStatus.CONFLICT;

        code = ErrorCode.USER_EMAIL_EXISTS;

        message = 'Email already registered';

        break;

      /**
       * Record not found
       */
      case 'P2025':
        status = HttpStatus.NOT_FOUND;

        code = ErrorCode.USER_NOT_FOUND;

        message = 'Resource not found';

        break;

      /**
       * Foreign key constraint
       */
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;

        message = 'Invalid relation';

        break;
    }

    response.status(status).json({
      success: false,

      error: {
        code,
        message,
        statusCode: status,
      },

      timestamp: new Date().toISOString(),

      path: request.url,
    });
  }
}
