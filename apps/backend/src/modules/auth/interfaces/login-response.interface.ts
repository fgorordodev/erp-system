import { UserResponseDto } from '@backend/modules/users/dto';
import { TokenPair } from './token-pair.interface';

export interface LoginResponse extends TokenPair {
  user: UserResponseDto;
}
