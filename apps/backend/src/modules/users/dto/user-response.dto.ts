import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'cm123abc',
  })
  id!: string;

  @ApiProperty({
    example: 'admin@erp.com',
  })
  email!: string;

  @ApiProperty({
    example: 'Admin',
  })
  firstName!: string;

  @ApiProperty({
    example: 'System',
  })
  lastName!: string;

  @ApiProperty({
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-07-22T21:00:00.000Z',
  })
  createdAt!: Date;
}
