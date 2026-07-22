import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '../../database';
import { PrismaHealthIndicator } from './indicators/prisma.health';

@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService, PrismaHealthIndicator],
})
export class HealthModule {}
