import { Global, Module } from '@nestjs/common';
import { HashService } from './crypto';
import { EncryptionService } from './crypto/ecryptation.service';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from './token';
import { SecurityJwtModule } from './jwt';
import { PermissionsGuard, RolesGuard } from './guards';

@Global()
@Module({
  imports: [ConfigModule, SecurityJwtModule],

  providers: [
    HashService,
    EncryptionService,
    TokenService,
    RolesGuard,
    PermissionsGuard,
  ],

  exports: [HashService, EncryptionService, TokenService, SecurityJwtModule],
})
export class SecurityModule {}
