import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token issued during authentication',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
