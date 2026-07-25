import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'One-time password reset token',
    example: '92c78a...',
  })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'New account password',
    minLength: 8,
    example: 'StrongPassword123!',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
