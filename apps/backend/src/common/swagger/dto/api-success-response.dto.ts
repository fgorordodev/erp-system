import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({
    description: 'Operation-specific response payload.',
  })
  data!: unknown;

  @ApiProperty({
    format: 'date-time',
    example: '2026-07-24T20:00:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({ example: '/api/users' })
  path!: string;
}
