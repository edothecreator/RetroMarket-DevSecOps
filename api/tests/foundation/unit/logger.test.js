const logger = require('../../../src/utils/logger');

describe('Logger Redaction Unit Tests', () => {
  let mockOutput;
  let originalConsoleLog;
  let originalConsoleWarn;
  let originalConsoleError;

  beforeEach(() => {
    // Capture all console output for testing
    mockOutput = [];
    
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    
    console.log = jest.fn((message) => {
      mockOutput.push(message);
    });
    console.warn = jest.fn((message) => {
      mockOutput.push(message);
    });
    console.error = jest.fn((message) => {
      mockOutput.push(message);
    });
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('Sensitive Field Redaction', () => {
    it('redacts password from logged messages', () => {
      const sensitiveData = {
        email: 'test@test.com',
        password: 'secret123',
        name: 'Test User'
      };

      logger.error('Login attempt failed', sensitiveData);

      const loggedContent = mockOutput.join(' ');
      expect(loggedContent).not.toMatch(/secret123/);
      expect(loggedContent).toMatch(/test@test.com/); // Non-sensitive data should be present
      expect(loggedContent).toMatch(/\[REDACTED\]/); // Should contain redaction marker
    });

    it('redacts token from logged messages', () => {
      const sensitiveData = {
        authorization: 'Bearer fake-jwt-token',
        token: 'another-token'
      };

      logger.error('Authentication failed', sensitiveData);

      const loggedContent = mockOutput.join(' ');
      expect(loggedContent).not.toMatch(/fake-jwt-token/);
      expect(loggedContent).not.toMatch(/another-token/);
      expect(loggedContent).toMatch(/\[REDACTED\]/); // Should contain redaction marker
    });

    it('redacts cookie from logged messages', () => {
      const sensitiveData = {
        cookie: 'sessionId=abc123; refreshToken=xyz789'
      };

      logger.error('Request failed', sensitiveData);

      const loggedContent = mockOutput.join(' ');
      expect(loggedContent).not.toMatch(/abc123/);
      expect(loggedContent).not.toMatch(/xyz789/);
      expect(loggedContent).toMatch(/\[REDACTED\]/); // Should contain redaction marker
    });

    it('preserves non-sensitive fields in logs', () => {
      const data = {
        userId: 123,
        email: 'test@test.com',
        status: 'active',
        password: 'secret' // This should be redacted
      };

      logger.info('User action', data);

      const loggedContent = mockOutput.join(' ');
      expect(loggedContent).toMatch(/123/);
      expect(loggedContent).toMatch(/test@test.com/);
      expect(loggedContent).toMatch(/active/);
      expect(loggedContent).not.toMatch(/secret/);
      expect(loggedContent).toMatch(/\[REDACTED\]/); // Should contain redaction marker
    });
  });

  describe('Different Log Levels', () => {
    it('redacts sensitive data in error logs', () => {
      logger.error('Error occurred', { password: 'secret' });
      const loggedContent = mockOutput.join(' ');
      expect(loggedContent).not.toMatch(/secret/);
      expect(loggedContent).toMatch(/\[REDACTED\]/);
    });

    it('redacts sensitive data in warn logs', () => {
      logger.warn('Warning occurred', { token: 'secret-token' });
      const loggedContent = mockOutput.join(' ');
      expect(loggedContent).not.toMatch(/secret-token/);
      expect(loggedContent).toMatch(/\[REDACTED\]/);
    });

    it('redacts sensitive data in info logs', () => {
      logger.info('Info message', { authorization: 'Bearer secret' });
      const loggedContent = mockOutput.join(' ');
      expect(loggedContent).not.toMatch(/Bearer secret/);
      expect(loggedContent).toMatch(/\[REDACTED\]/);
    });
  });
});