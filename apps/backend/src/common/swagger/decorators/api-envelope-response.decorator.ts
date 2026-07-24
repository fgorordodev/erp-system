import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { ApiSuccessResponseDto } from '@backend/common/swagger/dto';

interface EnvelopeOptions {
  description: string;
  type: Type<unknown>;
  isArray?: boolean;
}

function envelopeSchema(type: Type<unknown>, isArray = false) {
  return {
    allOf: [
      { $ref: getSchemaPath(ApiSuccessResponseDto) },
      {
        properties: {
          data: isArray
            ? {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              }
            : { $ref: getSchemaPath(type) },
        },
      },
    ],
  };
}

export function ApiOkEnvelope(options: EnvelopeOptions) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, options.type),
    ApiOkResponse({
      description: options.description,
      schema: envelopeSchema(options.type, options.isArray),
    }),
  );
}

export function ApiCreatedEnvelope(options: EnvelopeOptions) {
  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, options.type),
    ApiCreatedResponse({
      description: options.description,
      schema: envelopeSchema(options.type, options.isArray),
    }),
  );
}
