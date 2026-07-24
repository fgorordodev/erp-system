import { ApiProperty } from '@nestjs/swagger';

import { ErrorCode } from '@backend/common/exceptions';

export class ApiErrorDetailDto {
  @ApiProperty({
    enum: ErrorCode,
    enumName: 'ErrorCode',
    example: ErrorCode.VALIDATION_ERROR,
  })
  code!: ErrorCode;

  @ApiProperty({
    example: 'email must be an email',
    description: 'Human-readable error message.',
  })
  message!: string;

  @ApiProperty({ example: 400 })
  statusCode!: number;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ type: ApiErrorDetailDto })
  error!: ApiErrorDetailDto;

  @ApiProperty({
    format: 'date-time',
    example: '2026-07-24T20:00:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({ example: '/api/users' })
  path!: string;
}
