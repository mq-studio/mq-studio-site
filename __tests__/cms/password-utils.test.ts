/**
 * Password Utilities Test Suite
 * Tests bcrypt password hashing and comparison
 */

import { hashPassword, comparePassword } from '../../lib/utils/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });

    it('should generate different hashes for same password (due to salt)', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should reject empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password must be a non-empty string');
    });

    it('should reject non-string password', async () => {
      // @ts-expect-error Testing invalid input
      await expect(hashPassword(null)).rejects.toThrow('Password must be a non-empty string');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await hashPassword('TestPassword123!');
      const result = await comparePassword('', hash);
      expect(result).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      const result = await comparePassword('TestPassword123!', 'invalid-hash');
      expect(result).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const result = await comparePassword('TestPassword123!', '');
      expect(result).toBe(false);
    });
  });
});
