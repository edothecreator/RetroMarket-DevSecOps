const app = require('../../../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('../../helpers/test-db');
const { createTestUser } = require('../../helpers/test-factory');
const { login, register } = require('../../helpers/auth-requests');
const { SQLI_PAYLOADS, XSS_PAYLOADS } = require('../../helpers/security-payloads');
const RoleDao = require('../../../src/dao/RoleDao');

describe('Injection Prevention Tests', () => {
  let roleDao;

  beforeAll(async () => {
    await setupTestDatabase();
    roleDao = new RoleDao();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('SQL Injection Prevention', () => {
    describe.each(SQLI_PAYLOADS)('SQL payload: %s', (payload) => {
      it('handles SQL injection in email parameter without data leak', async () => {
        const response = await login(app, {
          email: payload,
          password: 'TestPass123!',
        });

        expect([400, 401]).toContain(response.status);
        expect(response.body).not.toHaveProperty('users');
        expect(response.status).not.toBe(500);
      });

      it('handles SQL injection in password without authentication bypass', async () => {
        const testUser = await createTestUser(roleDao);

        const response = await login(app, {
          email: testUser.user.email,
          password: payload,
        });

        expect(response.status).toBe(401);
        expect(response.status).not.toBe(500); // No server error
      });
    });
  });

  describe('XSS Prevention', () => {
    describe.each(XSS_PAYLOADS)('XSS payload: %s', (payload) => {
      it('stores XSS payload raw without execution or rejection', async () => {
        const response = await register(app, {
          firstName: payload,
        });

        if (response.status === 201) {
          // Check that the payload is stored (may be JSON-escaped but present)
          expect(response.body.firstName).toBeDefined();
          // The content should contain the core XSS pattern (even if escaped)
          const bodyStr = JSON.stringify(response.body);
          expect(bodyStr).toMatch(/script|img|javascript|svg/i);
        } else {
          // If rejected, should be 400, never 500
          expect(response.status).toBe(400);
        }
      });
    });
  });
});