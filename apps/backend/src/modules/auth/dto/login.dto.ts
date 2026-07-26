import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Registered user email address.',
    example: 'admin@erp.local',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Account password.',
    example: 'ChangeMe123!',
    minLength: 8,
    writeOnly: true,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    description: 'Extends the persistent session lifetime when enabled.',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  rememberMe = false;
}
