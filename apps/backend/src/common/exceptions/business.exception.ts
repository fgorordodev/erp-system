import { HttpException } from '@nestjs/common';

import { ErrorCode } from '@erp/api-contracts';
export class BusinessException extends HttpException {
  constructor(code: ErrorCode, message: string, statusCode = 400) {
    super(
      {
        code,
        message,
      },
      statusCode,
    );
  }
}
