import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from '@backend/modules/users/dto';
import { TokenPairResponseDto } from './token-pair-response.dto';

export class LoginResponseDto extends TokenPairResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}
