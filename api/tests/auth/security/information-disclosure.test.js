const app = require('../../../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('../../helpers/test-db');
const { createTestUser } = require('../../helpers/test-factory');
const { login, me } = require('../../helpers/auth-requests');
const RoleDao = require('../../../src/dao/RoleDao');

describe('Information Disclosure Prevention Tests', () => {
  let roleDao;

  beforeAll(async () => {
    await setupTestDatabase();
    roleDao = new RoleDao();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });



  describe('Sensitive Data Exposure', () => {
    it('does not expose passwordHash in responses', async () => {
      const user = await createTestUser(roleDao);

      const response = await me(app, user.auth);

      const body = JSON.stringify(response.body);
      expect(body).not.toMatch(/passwordHash/i);
      expect(body).not.toMatch(/\$2[aby]\$\d{2}\$/); // bcrypt hash pattern
    });
  });
});