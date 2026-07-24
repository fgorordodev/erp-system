import { UserResponseDto } from '../../users/dto';
import { TokenPair } from './token-pair.interface';

export interface LoginResponse extends TokenPair {
  user: UserResponseDto;
}
