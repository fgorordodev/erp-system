import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { createConfigServiceMock, type ConfigServiceMock } from '@test/mocks';

import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let module: TestingModule;
  let service: EncryptionService;

  let configServiceMock: ConfigServiceMock;

  const encryptionKey =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  beforeEach(async () => {
    configServiceMock = createConfigServiceMock();

    configServiceMock.getOrThrow.mockReturnValue(encryptionKey);

    module = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get(EncryptionService);
  });

  afterEach(async () => {
    await module.close();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('loads the encryption key from configuration', () => {
      expect(configServiceMock.getOrThrow).toHaveBeenCalledTimes(1);
      expect(configServiceMock.getOrThrow).toHaveBeenCalledWith(
        'ENCRYPTION_KEY',
      );
    });

    it('throws when the key length is invalid', async () => {
      configServiceMock.getOrThrow.mockReturnValue('abcd');

      await expect(
        Test.createTestingModule({
          providers: [
            EncryptionService,
            {
              provide: ConfigService,
              useValue: configServiceMock,
            },
          ],
        }).compile(),
      ).rejects.toThrow(
        'ENCRYPTION_KEY must be a 64-character hexadecimal string.',
      );
    });
  });

  describe('encrypt', () => {
    it('encrypts plaintext', () => {
      const encrypted = service.encrypt('Hello World');

      expect(encrypted).not.toBe('Hello World');

      const parts = encrypted.split(':');

      expect(parts).toHaveLength(3);

      expect(parts[0]).not.toHaveLength(0);
      expect(parts[1]).not.toHaveLength(0);
      expect(parts[2]).not.toHaveLength(0);
    });

    it('generates different ciphertexts for the same plaintext', () => {
      const first = service.encrypt('secret');
      const second = service.encrypt('secret');

      expect(first).not.toBe(second);
    });
  });

  describe('decrypt', () => {
    it('decrypts a previously encrypted value', () => {
      const original = 'Sensitive Information';

      const encrypted = service.encrypt(original);

      expect(service.decrypt(encrypted)).toBe(original);
    });

    it('throws when payload format is invalid', () => {
      expect(() => service.decrypt('invalid')).toThrow(
        'Invalid encrypted payload format.',
      );
    });

    it('throws when payload has missing sections', () => {
      expect(() => service.decrypt('a:b')).toThrow(
        'Invalid encrypted payload format.',
      );
    });

    it('throws when payload contains empty sections', () => {
      expect(() => service.decrypt('a::b')).toThrow(
        'Invalid encrypted payload format.',
      );
    });

    it('throws when iv length is invalid', () => {
      expect(() =>
        service.decrypt(
          ['abcd', '0123456789abcdef0123456789abcdef', '0123456789'].join(':'),
        ),
      ).toThrow('Invalid encryption initialization vector.');
    });

    it('throws when authentication tag is invalid', () => {
      const encrypted = service.encrypt('secret');

      const [iv, , cipher] = encrypted.split(':');

      const tampered = [iv, '00', cipher].join(':');

      expect(() => service.decrypt(tampered)).toThrow();
    });

    it('throws when ciphertext has been modified', () => {
      const encrypted = service.encrypt('secret');

      const [iv, tag, cipher] = encrypted.split(':');

      const tamperedCipher =
        cipher.slice(0, -2) + (cipher.endsWith('00') ? '01' : '00');

      expect(() =>
        service.decrypt([iv, tag, tamperedCipher].join(':')),
      ).toThrow();
    });
  });
});
