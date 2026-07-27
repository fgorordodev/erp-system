import {
  type ArgumentsHost,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import { ErrorCode } from '@erp/api-contracts';

import { BusinessException } from '../exceptions/business.exception';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const currentDate = new Date('2026-07-27T12:00:00.000Z');

  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });

  const response = {
    status,
  };

  const request = {
    url: '/users',
  };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as ArgumentsHost;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(currentDate);

    status.mockReturnValue({ json });

    filter = new HttpExceptionFilter();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('BusinessException', () => {
    it('returns the business error payload', () => {
      const exception = new BusinessException(
        ErrorCode.USER_EMAIL_EXISTS,
        'User already exists',
        409,
      );

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledTimes(1);
      expect(status).toHaveBeenCalledWith(409);

      expect(json).toHaveBeenCalledTimes(1);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: ErrorCode.USER_EMAIL_EXISTS,
          message: 'User already exists',
          statusCode: 409,
        },
        timestamp: currentDate.toISOString(),
        path: '/users',
      });
    });
  });

  describe('Nest built-in exceptions', () => {
    it.each([
      [
        new BadRequestException('Invalid request'),
        ErrorCode.VALIDATION_ERROR,
        400,
        'Invalid request',
      ],
      [
        new UnauthorizedException('Unauthorized'),
        ErrorCode.UNAUTHORIZED,
        401,
        'Unauthorized',
      ],
      [
        new ForbiddenException('Forbidden'),
        ErrorCode.FORBIDDEN,
        403,
        'Forbidden',
      ],
      [
        new NotFoundException('Not found'),
        ErrorCode.NOT_FOUND,
        404,
        'Not found',
      ],
      [new ConflictException('Conflict'), ErrorCode.CONFLICT, 409, 'Conflict'],
      [
        new ServiceUnavailableException('Service unavailable'),
        ErrorCode.SERVICE_UNAVAILABLE,
        503,
        'Service unavailable',
      ],
    ])(
      'maps status $2 to its corresponding error code',
      (exception, code, statusCode, message) => {
        filter.catch(exception, host);

        expect(status).toHaveBeenCalledWith(statusCode);

        expect(json).toHaveBeenCalledWith({
          success: false,
          error: {
            code,
            message,
            statusCode,
          },
          timestamp: currentDate.toISOString(),
          path: '/users',
        });
      },
    );

    it('joins array validation messages', () => {
      const exception = new BadRequestException([
        'email must be an email',
        'password should not be empty',
      ]);

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(400);

      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'email must be an email, password should not be empty',
          statusCode: 400,
        },
        timestamp: currentDate.toISOString(),
        path: '/users',
      });
    });
  });

  describe('fallback behavior', () => {
    it('uses INTERNAL_ERROR for an unmapped HTTP status', () => {
      const exception = new BadRequestException('Teapot error');

      jest.spyOn(exception, 'getStatus').mockReturnValue(418);

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(418);

      expect(json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Teapot error',
          statusCode: 418,
        },
        timestamp: currentDate.toISOString(),
        path: '/users',
      });
    });
  });
});
