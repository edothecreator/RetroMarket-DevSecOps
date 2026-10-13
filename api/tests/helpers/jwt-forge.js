const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../src/config/jwt');

/**
 * JWT token forge utilities for security testing
 */
class JwtForge {
  /**
   * Create a token with wrong secret
   */
  static wrongSecret(payload, options = {}) {
    return jwt.sign(payload, 'wrong-secret', {
      algorithm: 'HS256',
      ...options
    });
  }

  /**
   * Create an expired token
   */
  static expired(payload, options = {}) {
    return jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '-1h',
      ...options
    });
  }

  /**
   * Create a token with wrong algorithm
   */
  static wrongAlgorithm(payload, options = {}) {
    return jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS512',
      ...options
    });
  }

  /**
   * Create an alg=none attack token
   */
  static algNone(payload) {
    const header = { alg: 'none', typ: 'JWT' };
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${headerB64}.${payloadB64}.`;
  }

  /**
   * Create a token with tampered payload (keeping original signature)
   */
  static tamperedRoles(originalToken, newRoles) {
    const decoded = jwt.decode(originalToken, { complete: true });
    
    const tamperedPayload = {
      ...decoded.payload,
      roles: newRoles,
    };

    const header = Buffer.from(JSON.stringify(decoded.header)).toString('base64url');
    const payload = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url');
    const signature = originalToken.split('.')[2];
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Create a completely invalid token
   */
  static invalid() {
    return 'not.a.jwt.token';
  }

  /**
   * Create a valid token for control tests
   */
  static valid(payload, options = {}) {
    return jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '15m',
      ...options
    });
  }
}

module.exports = JwtForge;