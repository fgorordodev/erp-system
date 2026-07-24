import { Injectable } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';

import { PrismaHealthIndicator } from '@backend/modules/health/indicators';
import { HealthResponseDto } from '@backend/modules/health/dto';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
  ) {}

  async check(): Promise<HealthResponseDto> {
    const result = await this.health.check([
      () => this.prisma.check('database'),
    ]);

    const database = result.details?.database;
    const databaseStatus: 'up' | 'down' =
      database?.status === 'up' ? 'up' : 'down';

    return {
      status: result.status,
      services: {
        database: databaseStatus,
      },
    };
  }
}
