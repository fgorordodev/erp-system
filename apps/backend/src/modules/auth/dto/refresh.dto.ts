import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description:
      'One-time refresh token issued by login or the previous refresh.',
    example: '01f8b9f7fbe04f84a09a4d6d...',
    minLength: 32,
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  refreshToken!: string;
}
