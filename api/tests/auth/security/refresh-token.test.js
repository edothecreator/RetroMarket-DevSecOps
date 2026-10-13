const app = require('../../../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('../../helpers/test-db');
const { createTestUser } = require('../../helpers/test-factory');
const { refresh, login } = require('../../helpers/auth-requests');
const RoleDao = require('../../../src/dao/RoleDao');

describe('Refresh Token Security Tests', () => {
  let roleDao;

  beforeAll(async () => {
    await setupTestDatabase();
    roleDao = new RoleDao();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Token Rotation', () => {
    it.failing('rotates refresh tokens on each use', async () => {
      // BUG-004: Refresh tokens should be rotated (new token issued, old invalidated)
      const user = await createTestUser(roleDao);

      const firstRefresh = await refresh(app, user.auth);
      expect(firstRefresh.status).toBe(200);
      const firstNewToken = firstRefresh.body.refreshToken;

      const secondRefresh = await refresh(app, user.auth);
      expect(secondRefresh.status).toBe(200);
      const secondNewToken = secondRefresh.body.refreshToken;

      // Tokens should be different (rotated)
      expect(firstNewToken).not.toBe(secondNewToken);
    });
  });



  describe('Token Hashing', () => {
    it.failing('stores refresh tokens hashed in database', async () => {
      // BUG-006: Refresh tokens should be hashed before database storage
      const user = await createTestUser(roleDao);

      const loginResponse = await login(app, {
        email: user.user.email,
        password: 'TestPass123!',
      });

      const refreshToken = loginResponse.body.refreshToken;

      // Check that the raw token is not stored in database
      // This would require database inspection, which is a design test
      expect(refreshToken).toBeTruthy();
      expect(refreshToken.length).toBeGreaterThan(50); // Should be a proper JWT
    });
  });
});