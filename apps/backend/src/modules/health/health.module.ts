import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '@backend/database';
import { PrismaHealthIndicator } from '@backend/modules/health/indicators';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService, PrismaHealthIndicator],
})
export class HealthModule {}
