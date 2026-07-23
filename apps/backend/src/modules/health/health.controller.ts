import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../security';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Check API health status',
    description: 'Returns API and database availability',
  })
  check() {
    return this.healthService.check();
  }
}
