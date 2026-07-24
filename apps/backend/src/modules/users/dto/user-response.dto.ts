import { ApiProperty } from '@nestjs/swagger';

export class UserRoleResponseDto {
  @ApiProperty({ example: 'EMPLOYEE' })
  name!: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'cm123abc456' })
  id!: string;

  @ApiProperty({ example: 'admin@erp.com' })
  email!: string;

  @ApiProperty({ example: 'Admin' })
  firstName!: string;

  @ApiProperty({ example: 'System' })
  lastName!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ type: UserRoleResponseDto, isArray: true })
  roles!: UserRoleResponseDto[];

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-07-22T21:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-07-23T18:00:00.000Z',
  })
  updatedAt!: Date;
}
