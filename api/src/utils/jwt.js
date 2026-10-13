const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY, JWT_ALGORITHM } = require('../config/jwt');

function generateAccessToken(user) {
  const payload = {
    sub: user.id,
    roles: user.roles.map(r => r.name),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY, algorithm: JWT_ALGORITHM });
}

function generateRefreshToken(user) {
  const payload = {
    sub: user.id,
    roles: user.roles.map(r => r.name),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY, algorithm: JWT_ALGORITHM });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
