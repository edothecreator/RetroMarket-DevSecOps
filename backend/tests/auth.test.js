const request = require('supertest');
const app = require('../src/app');
const { sequelize, Role, User } = require('../src/models');
const { hashPassword } = require('../src/utils/password');
const RoleEnum = require('../src/constants/roles');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  
  await Role.create({ name: RoleEnum.ADMIN });
  await Role.create({ name: RoleEnum.ACHETEUR });
  await Role.create({ name: RoleEnum.VENDEUR });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth API - Happy Path', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user as acheteur', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.roles).toContain(RoleEnum.ACHETEUR);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should register a new user as vendeur', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'password456',
          role: RoleEnum.VENDEUR,
        });

      expect(response.status).toBe(201);
      expect(response.body.roles).toContain(RoleEnum.VENDEUR);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      const acheteurRole = await Role.findOne({ where: { name: RoleEnum.ACHETEUR } });
      const passwordHash = await hashPassword('testpass');
      const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        passwordHash,
      });
      await user.addRole(acheteurRole);
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('GET /api/auth/check-email', () => {
    it('should return exists true for existing email', async () => {
      const response = await request(app)
        .get('/api/auth/check-email')
        .query({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.exists).toBe(true);
    });

    it('should return exists false for non-existing email', async () => {
      const response = await request(app)
        .get('/api/auth/check-email')
        .query({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.exists).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass',
        });
      accessToken = loginResponse.body.accessToken;
    });

    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('passwordHash');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass',
        });
      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });
  });
});
