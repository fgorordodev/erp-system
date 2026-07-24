import { ApiProperty } from '@nestjs/swagger';

export class HealthServicesDto {
  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  database!: 'up' | 'down';
}

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok', 'error', 'shutting_down'], example: 'ok' })
  status!: 'ok' | 'error' | 'shutting_down';

  @ApiProperty({ type: HealthServicesDto })
  services!: HealthServicesDto;
}
