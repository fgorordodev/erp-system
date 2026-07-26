import { UserResponseDto } from '@backend/modules/users';
import { TokenPair } from './token-pair.interface';

export interface LoginResponse extends TokenPair {
  user: UserResponseDto;
}
