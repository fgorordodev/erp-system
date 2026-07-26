import { UserResponseDto } from '@backend/modules/users';
import { TokenPairResult } from './token-pair.result';

export interface LoginResult extends TokenPairResult {
  user: UserResponseDto;
}
