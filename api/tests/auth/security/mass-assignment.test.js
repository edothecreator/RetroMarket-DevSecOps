const app = require('../../../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('../../helpers/test-db');
const { register } = require('../../helpers/auth-requests');
const RoleEnum = require('../../../src/constants/roles');

describe('Mass Assignment Protection Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Unknown Fields Rejection', () => {
    it('returns 400 when registering with unknown fields', async () => {
      const response = await register(app, {
        maliciousField: 'hacker',
        isAdmin: true,
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Role Injection Prevention', () => {
    it('returns 400 when attempting to inject roles array', async () => {
      const response = await register(app, {
        roles: [RoleEnum.ADMIN],
      });

      expect(response.status).toBe(400);
    });

    it('returns 400 when attempting to inject admin role', async () => {
      const response = await register(app, {
        firstName: 'Hacker',
        lastName: 'User',
        role: RoleEnum.ADMIN,
      });

      expect(response.status).toBe(400);
    });
  });

  describe('ID and Sensitive Field Prevention', () => {
    it('returns 400 when attempting to inject passwordHash', async () => {
      const response = await register(app, {
        passwordHash: '$2b$12$hashedpassword',
      });

      expect(response.status).toBe(400);
    });

    it('returns 400 when attempting to inject id field', async () => {
      const response = await register(app, {
        id: 999,
      });

      expect(response.status).toBe(400);
    });

    it('returns 400 when attempting to inject ownerId', async () => {
      const response = await register(app, {
        ownerId: 999,
      });

      expect(response.status).toBe(400);
    });
  });
});