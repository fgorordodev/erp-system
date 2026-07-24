import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Opaque refresh token.',
    example: '01f8b9f7fbe04f84a09a4d6d...',
    minLength: 32,
    writeOnly: true,
  })
  @IsString()
  @MinLength(32)
  refreshToken!: string;
}
