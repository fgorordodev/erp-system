import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption/encryption.service';
import { PasswordHasherService } from './password/password-hasher.service';
import { SecureTokenService } from './tokens/secure-token.service';

@Module({
  providers: [EncryptionService, PasswordHasherService, SecureTokenService],
  exports: [EncryptionService, PasswordHasherService, SecureTokenService],
})
export class CryptoModule {}
