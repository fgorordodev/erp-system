import { Test, type TestingModule } from '@nestjs/testing';

import { PasswordHasherService } from './password-hasher.service';

describe('PasswordHasherService', () => {
  let module: TestingModule;
  let service: PasswordHasherService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [PasswordHasherService],
    }).compile();

    service = module.get(PasswordHasherService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('hash', () => {
    it('returns a bcrypt hash different from the original password', async () => {
      const password = 'Password123!';

      const hash = await service.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('generates different hashes for the same password', async () => {
      const password = 'Password123!';

      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('returns true for a matching password', async () => {
      const password = 'Password123!';
      const hash = await service.hash(password);

      await expect(service.compare(password, hash)).resolves.toBe(true);
    });

    it('returns false for a different password', async () => {
      const hash = await service.hash('Password123!');

      await expect(service.compare('WrongPassword!', hash)).resolves.toBe(
        false,
      );
    });

    it('returns false for an invalid hash', async () => {
      await expect(
        service.compare('Password123!', 'invalid-hash'),
      ).resolves.toBe(false);
    });
  });
});
