import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiErrorResponseDto } from '@backend/common/swagger/dto';

export function ApiValidationError() {
  return ApiBadRequestResponse({
    description: 'The request payload, parameter or query is invalid.',
    type: ApiErrorResponseDto,
  });
}

export function ApiProtectedErrors() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'The access token is missing, invalid or expired.',
      type: ApiErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'The authenticated user lacks the required permission.',
      type: ApiErrorResponseDto,
    }),
  );
}

export function ApiInternalError() {
  return ApiInternalServerErrorResponse({
    description: 'An unexpected server or database error occurred.',
    type: ApiErrorResponseDto,
  });
}
