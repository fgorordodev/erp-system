import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { BusinessException } from '../exceptions/business.exception';

import { ErrorCode } from '../exceptions/error.codes';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    let message = 'Unexpected error';

    let code = ErrorCode.INTERNAL_ERROR;

    /**
     * Business Exceptions
     */
    if (exception instanceof BusinessException) {
      const error = exceptionResponse as {
        code: ErrorCode;
        message: string;
      };

      code = error.code;
      message = error.message;
    }

    /**
     * Nest Built-in Exceptions
     */
    else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(', ')
        : String(exceptionResponse.message);

      code = this.mapHttpErrorCode(status);
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

  private mapHttpErrorCode(status: number): ErrorCode {
    switch (status) {
      case 400:
        return ErrorCode.VALIDATION_ERROR;

      case 401:
        return ErrorCode.UNAUTHORIZED;

      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }
}
