import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { ErrorCode } from '../exceptions';

interface PrismaErrorResponse {
  status: HttpStatus;
  code: ErrorCode;
  message: string;
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const context = host.switchToHttp();

    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const error = this.mapPrismaError(exception);

    response.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.status,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): PrismaErrorResponse {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          code: ErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
          message: 'A resource with the same unique value already exists',
        };

      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          code: ErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION,
          message: 'The referenced resource does not exist or is still in use',
        };

      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'The requested resource was not found',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.DATABASE_ERROR,
          message: 'An unexpected database error occurred',
        };
    }
  }
}
