require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: isTest 
    ? (process.env.DB_NAME_TEST || 'retromarket_test')
    : (process.env.DB_NAME || 'retromarket'),
  username: process.env.DB_USER || 'dev',
  password: process.env.DB_PASSWORD || 'dev123',
};