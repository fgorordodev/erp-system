import { Injectable } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';

import { PrismaHealthIndicator } from './indicators/prisma.health';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
  ) {}

  async check() {
    const result = await this.health.check([
      () => this.prisma.check('database'),
    ]);

    return {
      status: result.status,
      services: {
        database: result.details.database.status,
      },
    };
  }
}
