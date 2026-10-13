const request = require('supertest');
const app = require('../../../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('../../helpers/test-db');
const { createTestUser } = require('../../helpers/test-factory');
const { me } = require('../../helpers/auth-requests');
const JwtForge = require('../../helpers/jwt-forge');
const RoleDao = require('../../../src/dao/RoleDao');
const RoleEnum = require('../../../src/constants/roles');

describe('JWT Attacks Security Tests', () => {
  let roleDao;
  let validUser;

  beforeAll(async () => {
    await setupTestDatabase();
    roleDao = new RoleDao();
    validUser = await createTestUser(roleDao);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Missing Token', () => {
    it('returns 401 when accessing /me without token', async () => {
      const response = await me(app);
      expect(response.status).toBe(401);
    });

    it('returns 401 when accessing /refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');
      expect(response.status).toBe(401);
    });

    it('returns 401 with malformed Authorization header', async () => {
      const response = await me(app, 'InvalidHeader');
      expect(response.status).toBe(401);
    });
  });

  describe('Invalid Signatures', () => {
    it('returns 401 for token signed with wrong secret', async () => {
      const forgedToken = JwtForge.wrongSecret({
        sub: 999,
        roles: [RoleEnum.ADMIN]
      });

      const response = await me(app, `Bearer ${forgedToken}`);
      expect(response.status).toBe(401);
    });

    it('returns 401 for token with tampered payload (admin role escalation)', async () => {
      const tamperedToken = JwtForge.tamperedRoles(validUser.token, [RoleEnum.ADMIN]);
      
      const response = await me(app, `Bearer ${tamperedToken}`);
      expect(response.status).toBe(401);
    });
  });

  describe('Expired Tokens', () => {
    it('returns 401 for expired token', async () => {
      const expiredToken = JwtForge.expired({
        sub: validUser.user.id,
        roles: validUser.user.roles.map(r => r.name)
      });

      const response = await me(app, `Bearer ${expiredToken}`);
      expect(response.status).toBe(401);
    });
  });

  describe('Algorithm Attacks', () => {
    it('returns 401 for token with wrong algorithm', async () => {
      const wrongAlgToken = JwtForge.wrongAlgorithm({
        sub: validUser.user.id,
        roles: validUser.user.roles.map(r => r.name)
      });

      const response = await me(app, `Bearer ${wrongAlgToken}`);
      expect(response.status).toBe(401);
    });

    it('returns 401 for alg=none attack', async () => {
      // BUG-001: This was previously failing but now passes (false bug)
      const algNoneToken = JwtForge.algNone({
        sub: validUser.user.id,
        roles: validUser.user.roles.map(r => r.name)
      });

      const response = await me(app, `Bearer ${algNoneToken}`);
      expect(response.status).toBe(401);
    });
  });

  describe('Malformed Tokens', () => {
    it('returns 401 for completely invalid token string', async () => {
      const response = await me(app, `Bearer ${JwtForge.invalid()}`);
      expect(response.status).toBe(401);
    });
  });

  describe('Control Test', () => {
    it('accepts valid token', async () => {
      const response = await me(app, validUser.auth);
      expect(response.status).toBe(200);
    });
  });
});