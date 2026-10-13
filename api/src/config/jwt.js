require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('CONFIG_MISSING_JWT_SECRET: JWT_SECRET environment variable is required');
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('CONFIG_INVALID_JWT_SECRET: JWT_SECRET must be at least 32 characters long');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';
const JWT_ALGORITHM = 'HS256';

module.exports = {
  JWT_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  JWT_ALGORITHM,
};
