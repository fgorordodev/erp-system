import { SecureTokenService } from './secure-token.service';

describe('SecureTokenService', () => {
  let service: SecureTokenService;

  beforeEach(() => {
    service = new SecureTokenService();
  });

  describe('generate', () => {
    it('generates a 32-byte hexadecimal token by default', () => {
      const token = service.generate();

      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('generates a token using the requested byte length', () => {
      const bytes = 16;

      const token = service.generate(bytes);

      expect(token).toHaveLength(bytes * 2);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('generates different tokens on consecutive calls', () => {
      const firstToken = service.generate();
      const secondToken = service.generate();

      expect(firstToken).not.toBe(secondToken);
    });
  });

  describe('hash', () => {
    it('returns the SHA-256 hexadecimal hash of a token', () => {
      const token = 'secure-token';

      const result = service.hash(token);

      expect(result).toBe(
        'c4be219b764b4ccd4109e2bf58178086c112e30e5fbf1dea35178ebe0cf0e5db',
      );
    });

    it('returns a 64-character hexadecimal value', () => {
      const result = service.hash('another-secure-token');

      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]+$/);
    });

    it('returns the same hash for the same token', () => {
      const token = 'repeatable-token';

      const firstHash = service.hash(token);
      const secondHash = service.hash(token);

      expect(firstHash).toBe(secondHash);
    });

    it('returns different hashes for different tokens', () => {
      const firstHash = service.hash('first-token');
      const secondHash = service.hash('second-token');

      expect(firstHash).not.toBe(secondHash);
    });
  });
});
