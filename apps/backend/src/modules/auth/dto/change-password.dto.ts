import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current account password.',
    example: 'CurrentPassword123!',
    minLength: 8,
    writeOnly: true,
  })
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty({
    description: 'Replacement account password.',
    example: 'NewPassword456!',
    minLength: 8,
    writeOnly: true,
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
