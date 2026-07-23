import { Global, Module } from '@nestjs/common';

import { EncryptionService, HashService } from './crypto';
import { SecurityJwtModule } from './jwt';
import { TokenService } from './token';

@Global()
@Module({
  imports: [SecurityJwtModule],
  providers: [HashService, EncryptionService, TokenService],
  exports: [HashService, EncryptionService, TokenService, SecurityJwtModule],
})
export class SecurityModule {}
