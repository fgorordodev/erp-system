import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'admin@erp.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    example: 'Admin',
    description: 'User first name',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    example: 'System',
    description: 'User last name',
  })
  @IsString()
  lastName!: string;
}
