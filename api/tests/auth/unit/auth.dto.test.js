const { registerSchema, loginSchema, passwordSchema } = require('../../../src/dto/authDto');

describe('Auth DTO - Unit Tests', () => {
  describe('passwordSchema', () => {
    it('should accept strong password', () => {
      const validPasswords = [
        'StrongPass123!',
        'MyP@ssw0rd123',
        'Secure#Pass1',
        'Test123!@#ABC',
      ];

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject password shorter than 12 characters', () => {
      expect(() => passwordSchema.parse('Short1!')).toThrow(/at least 12 characters/);
    });

    it('should reject password without uppercase', () => {
      expect(() => passwordSchema.parse('lowercase123!')).toThrow(/uppercase letter/);
    });

    it('should reject password without lowercase', () => {
      expect(() => passwordSchema.parse('UPPERCASE123!')).toThrow(/lowercase letter/);
    });

    it('should reject password without digit', () => {
      expect(() => passwordSchema.parse('NoDigitsHere!')).toThrow(/digit/);
    });

    it('should reject password without special character', () => {
      expect(() => passwordSchema.parse('NoSpecial123')).toThrow(/special character/);
    });

    it('should accept all required special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      specialChars.split('').forEach(char => {
        const password = `Pass123${char}word`;
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });
  });

  describe('registerSchema', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'StrongPass123!',
    };

    it('should accept valid registration data', () => {
      const result = registerSchema.parse(validData);

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.password).toBe('StrongPass123!');
      expect(result.role).toBe('acheteur');
    });

    it('should accept vendeur role', () => {
      const data = { ...validData, role: 'vendeur' };
      const result = registerSchema.parse(data);

      expect(result.role).toBe('vendeur');
    });

    it('should default to acheteur role when not provided', () => {
      const result = registerSchema.parse(validData);

      expect(result.role).toBe('acheteur');
    });

    it('should reject admin role', () => {
      const data = { ...validData, role: 'admin' };

      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should reject unknown role', () => {
      const data = { ...validData, role: 'superuser' };

      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should reject missing firstName', () => {
      const data = { ...validData };
      delete data.firstName;

      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should reject missing lastName', () => {
      const data = { ...validData };
      delete data.lastName;

      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should reject missing email', () => {
      const data = { ...validData };
      delete data.email;

      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should reject invalid email format', () => {
      const data = { ...validData, email: 'not-an-email' };

      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should reject missing password', () => {
      const data = { ...validData };
      delete data.password;

      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should reject unknown fields with strict mode', () => {
      const data = { ...validData, hackerField: 'malicious' };

      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should reject attempt to inject roles array', () => {
      const data = { ...validData, roles: ['admin'] };

      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should trim and validate field lengths', () => {
      const longString = 'a'.repeat(101);
      const data = { ...validData, firstName: longString };

      expect(() => registerSchema.parse(data)).toThrow();
    });
  });

  describe('loginSchema', () => {
    const validData = {
      email: 'user@example.com',
      password: 'anypassword',
    };

    it('should accept valid login data', () => {
      const result = loginSchema.parse(validData);

      expect(result.email).toBe('user@example.com');
      expect(result.password).toBe('anypassword');
    });

    it('should reject invalid email format', () => {
      const data = { ...validData, email: 'invalid' };

      expect(() => loginSchema.parse(data)).toThrow();
    });

    it('should reject missing email', () => {
      const data = { ...validData };
      delete data.email;

      expect(() => loginSchema.parse(data)).toThrow();
    });

    it('should reject missing password', () => {
      const data = { ...validData };
      delete data.password;

      expect(() => loginSchema.parse(data)).toThrow();
    });

    it('should reject unknown fields with strict mode', () => {
      const data = { ...validData, extra: 'field' };

      expect(() => loginSchema.parse(data)).toThrow();
    });

    it('should accept any password length for login', () => {
      const data = { ...validData, password: 'a' };

      expect(() => loginSchema.parse(data)).not.toThrow();
    });
  });
});
