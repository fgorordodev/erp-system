import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenService {
  generate(bytes = 32): string {
    return randomBytes(bytes).toString('hex');
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
