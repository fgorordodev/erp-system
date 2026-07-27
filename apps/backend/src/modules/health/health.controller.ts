import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiErrorResponseDto, ApiOkEnvelope } from '@backend/common';
import { HealthResponseDto } from './dto';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Check API readiness',
    description:
      'Returns the API readiness status and verifies PostgreSQL connectivity.',
  })
  @ApiOkEnvelope({
    description: 'The API and required database dependency are available.',
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'A required dependency is unavailable.',
    type: ApiErrorResponseDto,
  })
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}
