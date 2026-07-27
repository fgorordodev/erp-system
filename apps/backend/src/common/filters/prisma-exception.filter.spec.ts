import { type ArgumentsHost, HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@erp/api-contracts';
import { Prisma } from '@erp/database';

import { PrismaExceptionFilter } from './prisma-exception.filter';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

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

    filter = new PrismaExceptionFilter();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const createException = (
    code: string,
  ): Prisma.PrismaClientKnownRequestError =>
    new Prisma.PrismaClientKnownRequestError('Prisma error', {
      code,
      clientVersion: '6.16.2',
    });

  it.each([
    [
      'P2002',
      HttpStatus.CONFLICT,
      ErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
      'A resource with the same unique value already exists',
    ],
    [
      'P2003',
      HttpStatus.BAD_REQUEST,
      ErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION,
      'The referenced resource does not exist or is still in use',
    ],
    [
      'P2025',
      HttpStatus.NOT_FOUND,
      ErrorCode.RESOURCE_NOT_FOUND,
      'The requested resource was not found',
    ],
    [
      'P9999',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DATABASE_ERROR,
      'An unexpected database error occurred',
    ],
  ])('maps %s correctly', (code, statusCode, errorCode, message) => {
    filter.catch(createException(code), host);

    expect(status).toHaveBeenCalledWith(statusCode);

    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: errorCode,
        message,
        statusCode,
      },
      timestamp: currentDate.toISOString(),
      path: '/users',
    });
  });
});
