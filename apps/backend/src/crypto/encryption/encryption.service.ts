import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  private readonly algorithm = 'aes-256-gcm';

  private static readonly IV_LENGTH = 16;

  private static readonly KEY_LENGTH = 32;

  private static readonly PAYLOAD_PARTS = 3;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey =
      this.configService.getOrThrow<string>('ENCRYPTION_KEY');

    this.key = Buffer.from(encryptionKey, 'hex');

    if (this.key.length !== EncryptionService.KEY_LENGTH) {
      throw new Error(
        'ENCRYPTION_KEY must be a 64-character hexadecimal string.',
      );
    }
  }

  encrypt(value: string): string {
    const iv = randomBytes(EncryptionService.IV_LENGTH);

    const cipher = createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted.toString('hex'),
    ].join(':');
  }

  decrypt(payload: string): string {
    const parts = payload.split(':');

    if (
      parts.length !== EncryptionService.PAYLOAD_PARTS ||
      parts.some((part) => part.length === 0)
    ) {
      throw new Error('Invalid encrypted payload format.');
    }

    const [ivHex, authTagHex, encryptedHex] = parts as [string, string, string];

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    if (iv.length !== EncryptionService.IV_LENGTH) {
      throw new Error('Invalid encryption initialization vector.');
    }

    const decipher = createDecipheriv(this.algorithm, this.key, iv);

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
