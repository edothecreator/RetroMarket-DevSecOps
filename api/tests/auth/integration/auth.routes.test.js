const request = require('supertest');
const app = require('../../../src/app');
const { setupTestDatabase, cleanupTestDatabase } = require('../../helpers/test-db');
const { createTestUser, uniqueEmail } = require('../../helpers/test-factory');
const RoleDao = require('../../../src/dao/RoleDao');
const RoleEnum = require('../../../src/constants/roles');

describe('Auth Routes - Integration Tests', () => {
  let roleDao;

  beforeAll(async () => {
    await setupTestDatabase();
    roleDao = new RoleDao();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new acheteur successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: uniqueEmail(),
          password: 'StrongPass123!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body.roles).toContain(RoleEnum.ACHETEUR);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should register a vendeur successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Vendor',
          email: uniqueEmail(),
          password: 'VendorPass123!',
          role: RoleEnum.VENDEUR,
        });

      expect(response.status).toBe(201);
      expect(response.body.roles).toContain(RoleEnum.VENDEUR);
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: uniqueEmail(),
          password: 'weak',
        });

      expect(response.status).toBe(400);
    });

    it('should reject admin role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Hacker',
          lastName: 'User',
          email: uniqueEmail(),
          password: 'HackerPass123!',
          role: RoleEnum.ADMIN,
        });

      expect(response.status).toBe(400);
    });

    it('should reject duplicate email', async () => {
      const email = uniqueEmail();
      
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'First',
          lastName: 'User',
          email,
          password: 'FirstPass123!',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Second',
          lastName: 'User',
          email,
          password: 'SecondPass123!',
        });

      expect(response.status).toBe(409);
    });

    it('should reject unknown fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: uniqueEmail(),
          password: 'TestPass123!',
          maliciousField: 'hacker',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    const testPassword = 'LoginTest123!';
    let testUser;

    beforeAll(async () => {
      testUser = await createTestUser(roleDao, RoleEnum.ACHETEUR, { password: testPassword });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.user.email,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 for unknown email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@test.com',
          password: testPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.user.email,
          password: 'WrongPass123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should normalize email case', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.user.email.toUpperCase(),
          password: testPassword,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;

    beforeAll(async () => {
      testUser = await createTestUser(roleDao);
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', testUser.auth);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.user.id);
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser;

    beforeAll(async () => {
      testUser = await createTestUser(roleDao);
    });

    it('should refresh tokens with valid refresh token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.user.email,
          password: testUser.plainPassword,
        });

      const refreshToken = loginResponse.body.refreshToken;

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/check-email (removed endpoint)', () => {
    it('should return 404 for removed check-email endpoint', async () => {
      const response = await request(app)
        .get('/api/auth/check-email')
        .query({ email: 'test@test.com' });

      expect(response.status).toBe(404);
    });
  });
});
