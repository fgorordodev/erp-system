import { UserResponseDto } from '@backend/modules/users';

import type { TokenPairResult } from './token-pair.result';

export type LoginResult = TokenPairResult & {
  user: UserResponseDto;
};
