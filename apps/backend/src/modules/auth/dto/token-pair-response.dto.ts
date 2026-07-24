import { ApiProperty } from '@nestjs/swagger';

export class TokenPairResponseDto {
  @ApiProperty({
    description: 'Short-lived JWT used as a Bearer access token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Opaque one-time refresh token. Store it securely.',
    example: '01f8b9f7fbe04f84a09a4d6d...',
    writeOnly: true,
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Access-token lifetime in seconds.',
    example: 900,
  })
  expiresIn!: number;
}
