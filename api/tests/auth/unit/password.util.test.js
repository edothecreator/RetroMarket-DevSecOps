const { hashPassword, comparePassword } = require('../../../src/utils/password');

describe('Password Utility - Unit Tests', () => {
  describe('hashPassword', () => {
    it('should hash a password with bcrypt cost factor 12', async () => {
      const password = 'MySecurePass123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$12\$/);
    });

    it('should generate unique salt for each hash', async () => {
      const password = 'SamePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle special characters in password', async () => {
      const password = 'P@$$w0rd!#%&*()';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$12\$/);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword('WrongPassword123!', hash);

      expect(isMatch).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'CaseSensitive123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword('casesensitive123!', hash);

      expect(isMatch).toBe(false);
    });

    it('should detect even minor differences', async () => {
      const password = 'Password123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword('Password123', hash);

      expect(isMatch).toBe(false);
    });
  });
});
