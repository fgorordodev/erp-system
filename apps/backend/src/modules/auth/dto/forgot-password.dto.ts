import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address associated with the account.',
    example: 'user@example.com',
  })
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
