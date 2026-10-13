const app = require('../../../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('../../helpers/test-db');
const { register } = require('../../helpers/auth-requests');
const { WEAK_PASSWORDS, LONG_STRINGS } = require('../../helpers/security-payloads');

describe('Input Validation Security Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Password Policy Enforcement', () => {
    describe.each(WEAK_PASSWORDS)('Weak password: %s', (password) => {
      it('returns 400 for weak password', async () => {
        const response = await register(app, { password });
        expect(response.status).toBe(400);
      });
    });

    it('accepts strong password (control)', async () => {
      const response = await register(app, {
        password: 'Str@ng$1?2#3',
      });
      expect(response.status).toBe(201);
    });
  });

  describe('Field Length Limits', () => {
    it('returns 400 for oversized firstName', async () => {
      const response = await register(app, {
        firstName: LONG_STRINGS.OVERSIZED_FIRSTNAME,
      });
      expect(response.status).toBe(400);
    });

    it('returns 400 for oversized email', async () => {
      const response = await register(app, {
        email: LONG_STRINGS.OVERSIZED_EMAIL,
      });
      expect(response.status).toBe(400);
    });
  });

  describe('Request Body Size Limits', () => {
    it('returns 413 for oversized request body (> 10kb)', async () => {
      // BUG-003: This was previously failing but now passes (false bug)
      const response = await register(app, {
        extraData: LONG_STRINGS.OVERSIZED_BODY_DATA,
      });

      expect(response.status).toBe(413); // Payload Too Large
    });
  });
});