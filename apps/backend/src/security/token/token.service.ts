import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class TokenService {
  /**
   * Generates a cryptographically secure random token.
   *
   * @param bytes Size of the generated token.
   */
  generate(bytes = 32): string {
    return randomBytes(bytes).toString('hex');
  }
}
