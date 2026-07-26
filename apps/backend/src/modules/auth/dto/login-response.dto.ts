import { ApiProperty } from '@nestjs/swagger';

import { TokenPairResponseDto } from './token-pair-response.dto';
import { UserResponseDto } from '@backend/modules/users';

export class LoginResponseDto extends TokenPairResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}
