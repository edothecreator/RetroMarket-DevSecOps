const request = require('supertest');
const { uniqueEmail } = require('./test-factory');

/**
 * Common authentication request patterns for security testing
 */

const BASE_PATH = '/api/auth';

const VALID_REGISTRATION_DATA = {
  firstName: 'Test',
  lastName: 'User',
  password: 'TestPass123!',
};

/**
 * Register a new user with unique email
 */
function register(app, overrides = {}) {
  return request(app)
    .post(`${BASE_PATH}/register`)
    .send({
      ...VALID_REGISTRATION_DATA,
      email: uniqueEmail(),
      ...overrides
    });
}

/**
 * Login with credentials
 */
function login(app, credentials) {
  return request(app)
    .post(`${BASE_PATH}/login`)
    .send(credentials);
}

/**
 * Access /me endpoint
 */
function me(app, authHeader) {
  const req = request(app).get(`${BASE_PATH}/me`);
  if (authHeader) {
    req.set('Authorization', authHeader);
  }
  return req;
}

/**
 * Refresh token
 */
function refresh(app, authHeader) {
  const req = request(app).post(`${BASE_PATH}/refresh`);
  if (authHeader) {
    req.set('Authorization', authHeader);
  }
  return req;
}

module.exports = {
  BASE_PATH,
  VALID_REGISTRATION_DATA,
  register,
  login,
  me,
  refresh,
};