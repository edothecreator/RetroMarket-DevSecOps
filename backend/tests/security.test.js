const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { sequelize, Role, User } = require('../src/models');
const { hashPassword } = require('../src/utils/password');
const RoleEnum = require('../src/constants/roles');
const { JWT_SECRET } = require('../src/config/jwt');

if (process.env.NODE_ENV !== 'test') {
  throw new Error('SAFETY: Tests must run with NODE_ENV=test');
}

if (!sequelize.config.database.endsWith('_test')) {
  throw new Error(`SAFETY: Test database name must end with "_test". Current: ${sequelize.config.database}`);
}

let roles = {};
let testUserCounter = 0;

async function createUser(email, roleName) {
  const password = 'StrongTestPass123!@#';
  const passwordHash = await hashPassword(password);
  
  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email,
    passwordHash,
  });

  const role = roles[roleName];
  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }
  
  await user.addRole(role);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return {
    id: user.id,
    email: user.email,
    token: loginResponse.body.accessToken,
    refreshToken: loginResponse.body.refreshToken,
    auth: `Bearer ${loginResponse.body.accessToken}`,
  };
}

function uniqueEmail() {
  testUserCounter++;
  return `test-user-${testUserCounter}-${Date.now()}@test.local`;
}

beforeAll(async () => {
  await sequelize.sync({ force: true });
  
  roles.admin = await Role.create({ name: RoleEnum.ADMIN });
  roles.acheteur = await Role.create({ name: RoleEnum.ACHETEUR });
  roles.vendeur = await Role.create({ name: RoleEnum.VENDEUR });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Security Tests', () => {
  describe('Group 1: No token -> 401 (protected routes)', () => {
    it('GET /api/auth/me without Authorization header -> 401', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('POST /api/auth/refresh without Authorization header -> 401', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('GET /api/auth/me with invalid header (no Bearer prefix) -> 401', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidToken123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Group 2: Rejected tokens (VULN-04)', () => {
    it('VULN-04: Random string not.a.jwt -> 401', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not.a.jwt');

      expect(response.status).toBe(401);
    });

    it('VULN-04: Token forged with wrong secret and role admin -> 401', async () => {
      const forgedPayload = {
        sub: 999,
        roles: [RoleEnum.ADMIN],
      };
      const forgedToken = jwt.sign(forgedPayload, 'wrong-secret-key', { expiresIn: '1h' });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(response.status).toBe(401);
    });

    it('VULN-04: Valid token with modified payload (role admin) and original signature -> 401', async () => {
      const user = await createUser(uniqueEmail(), RoleEnum.ACHETEUR);
      
      const decoded = jwt.decode(user.token, { complete: true });
      const modifiedPayload = {
        ...decoded.payload,
        roles: [RoleEnum.ADMIN],
      };
      
      const header = Buffer.from(JSON.stringify(decoded.header)).toString('base64url');
      const payload = Buffer.from(JSON.stringify(modifiedPayload)).toString('base64url');
      const signature = user.token.split('.')[2];
      const tamperedToken = `${header}.${payload}.${signature}`;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
    });

    it('VULN-04: Expired token -> 401', async () => {
      const expiredPayload = {
        sub: 1,
        roles: [RoleEnum.ACHETEUR],
      };
      const expiredToken = jwt.sign(expiredPayload, JWT_SECRET, { expiresIn: '-1h' });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('VULN-04: Refresh token used as access token -> 401', async () => {
      const user = await createUser(uniqueEmail(), RoleEnum.ACHETEUR);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${user.refreshToken}`);

      expect(response.status).toBe(401);
    });

    it('Control: Valid token -> 200', async () => {
      const user = await createUser(uniqueEmail(), RoleEnum.ACHETEUR);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', user.auth);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(user.email);
    });
  });

  describe('Group 3: Registration and roles', () => {
    it('Registration with role admin is rejected (400)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Hacker',
          lastName: 'Test',
          email: uniqueEmail(),
          password: 'StrongPass123!',
          role: RoleEnum.ADMIN,
        });

      expect(response.status).toBe(400);
    });

    it('Registration with unknown extra field does not create admin', async () => {
      const email = uniqueEmail();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email,
          password: 'StrongPass123!',
          roles: [RoleEnum.ADMIN],
        });

      expect(response.status).toBe(400);
    });

    it('Control: Registration with role vendeur -> 201', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Vendor',
          lastName: 'Test',
          email: uniqueEmail(),
          password: 'StrongPass123!',
          role: RoleEnum.VENDEUR,
        });

      expect(response.status).toBe(201);
      expect(response.body.roles).toContain(RoleEnum.VENDEUR);
      expect(response.body.roles).not.toContain(RoleEnum.ADMIN);
    });
  });

  describe('Group 4: Login and response leaks (VULN-01, VULN-07)', () => {
    beforeAll(async () => {
      const email = 'existing-user@test.local';
      const passwordHash = await hashPassword('CorrectPassword123!');
      const user = await User.create({
        firstName: 'Existing',
        lastName: 'User',
        email,
        passwordHash,
      });
      await user.addRole(roles.acheteur);
    });

    it('VULN-01: Same status and same body for unknown email and wrong password', async () => {
      const unknownEmailResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown-email@test.local',
          password: 'AnyPassword123!',
        });

      const wrongPasswordResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'existing-user@test.local',
          password: 'WrongPassword123!',
        });

      expect(unknownEmailResponse.status).toBe(wrongPasswordResponse.status);
      expect(unknownEmailResponse.body.error.message).toBe(wrongPasswordResponse.body.error.message);
    });

    it('No response contains passwordHash on register', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: uniqueEmail(),
          password: 'TestPassword123!',
        });

      const body = JSON.stringify(response.body);
      expect(body).not.toMatch(/passwordHash/i);
      expect(body).not.toMatch(/password_hash/i);
      expect(body).not.toMatch(/\$2[ab]\$\d{2}\$/);
    });

    it('No response contains passwordHash on login', async () => {
      const user = await createUser(uniqueEmail(), RoleEnum.ACHETEUR);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'StrongTestPass123!@#',
        });

      const body = JSON.stringify(response.body);
      expect(body).not.toMatch(/passwordHash/i);
      expect(body).not.toMatch(/password_hash/i);
      expect(body).not.toMatch(/\$2[ab]\$\d{2}\$/);
    });

    it('No response contains passwordHash on /me', async () => {
      const user = await createUser(uniqueEmail(), RoleEnum.ACHETEUR);
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', user.auth);

      const body = JSON.stringify(response.body);
      expect(body).not.toMatch(/passwordHash/i);
      expect(body).not.toMatch(/password_hash/i);
      expect(body).not.toMatch(/\$2[ab]\$\d{2}\$/);
    });

    it('VULN-07: Error on unknown route has no stack trace in body', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route');

      const body = JSON.stringify(response.body);
      expect(body).not.toMatch(/stack/i);
      expect(body).not.toMatch(/at\s+\w+/);
      expect(body).not.toMatch(/node_modules/);
    });
  });
});
