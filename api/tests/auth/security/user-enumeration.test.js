const request = require('supertest');
const app = require('../../../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('../../helpers/test-db');
const { createTestUser, uniqueEmail } = require('../../helpers/test-factory');
const { login, register } = require('../../helpers/auth-requests');
const RoleDao = require('../../../src/dao/RoleDao');

describe('User Enumeration Prevention Tests', () => {
  let roleDao;

  beforeAll(async () => {
    await setupTestDatabase();
    roleDao = new RoleDao();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Login Error Messages', () => {
    it('returns identical error for unknown email and wrong password', async () => {
      const user = await createTestUser(roleDao);

      const unknownEmailResponse = await login(app, {
        email: 'unknown@test.com',
        password: 'TestPass123!',
      });

      const wrongPasswordResponse = await login(app, {
        email: user.user.email,
        password: 'WrongPass123!',
      });

      expect(unknownEmailResponse.status).toBe(wrongPasswordResponse.status);
      expect(unknownEmailResponse.body.error.message).toBe(wrongPasswordResponse.body.error.message);
      expect(unknownEmailResponse.body.error.message).toBe('Invalid credentials');
    });
  });

  describe('Registration Error Messages', () => {
    it('does not confirm email existence in registration errors', async () => {
      const email = uniqueEmail();

      // First registration should succeed
      await register(app, { email });

      // Second registration with same email should not reveal existence
      const response = await register(app, { email });

      expect(response.body.error.message).not.toMatch(/already/i);
      expect(response.body.error.message).not.toMatch(/exists/i);
      expect(response.body.error.message).toBe('Unable to complete registration');
    });
  });

  describe('Removed Endpoints', () => {
    it('returns 404 for removed check-email endpoint', async () => {
      const response = await request(app)
        .get('/api/auth/check-email')
        .query({ email: 'test@test.com' });

      expect(response.status).toBe(404);
    });
  });
});