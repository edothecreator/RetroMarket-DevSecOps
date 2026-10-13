const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../../../src/utils/jwt');
const { JWT_SECRET, JWT_ALGORITHM } = require('../../../src/config/jwt');

describe('JWT Utility - Unit Tests', () => {
  const mockUser = {
    id: 123,
    roles: [{ name: 'acheteur' }, { name: 'vendeur' }],
  };

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateAccessToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include user id in sub claim', () => {
      const token = generateAccessToken(mockUser);
      const decoded = jwt.decode(token);

      expect(decoded.sub).toBe(mockUser.id);
    });

    it('should include roles in payload', () => {
      const token = generateAccessToken(mockUser);
      const decoded = jwt.decode(token);

      expect(decoded.roles).toEqual(['acheteur', 'vendeur']);
    });

    it('should use HS256 algorithm', () => {
      const token = generateAccessToken(mockUser);
      const decoded = jwt.decode(token, { complete: true });

      expect(decoded.header.alg).toBe('HS256');
    });

    it('should set 15 minute expiration', () => {
      const token = generateAccessToken(mockUser);
      const decoded = jwt.decode(token);

      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + 15 * 60;

      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExp - 5);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 5);
    });

    it('should be verifiable with correct secret', () => {
      const token = generateAccessToken(mockUser);

      expect(() => {
        jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
      }).not.toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateRefreshToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include user id in sub claim', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = jwt.decode(token);

      expect(decoded.sub).toBe(mockUser.id);
    });

    it('should include roles in payload', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = jwt.decode(token);

      expect(decoded.roles).toEqual(['acheteur', 'vendeur']);
    });

    it('should set 7 day expiration', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = jwt.decode(token);

      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + 7 * 24 * 60 * 60;

      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExp - 5);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 5);
    });

    it('should use HS256 algorithm', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = jwt.decode(token, { complete: true });

      expect(decoded.header.alg).toBe('HS256');
    });
  });

  describe('Token differences', () => {
    it('should generate same tokens for same user at same time', () => {
      const token1 = generateAccessToken(mockUser);
      const token2 = generateAccessToken(mockUser);

      // JWT tokens with identical payload and timestamp will be identical
      // This is expected behavior - tokens are deterministic
      expect(token1).toBe(token2);
    });

    it('access and refresh tokens should be different', () => {
      const accessToken = generateAccessToken(mockUser);
      const refreshToken = generateRefreshToken(mockUser);

      expect(accessToken).not.toBe(refreshToken);

      const accessDecoded = jwt.decode(accessToken);
      const refreshDecoded = jwt.decode(refreshToken);

      expect(accessDecoded.exp).not.toBe(refreshDecoded.exp);
    });
  });
});
