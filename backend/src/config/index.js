require('dotenv').config();
require('dotenv').config({ path: '../.env' });

const env = process.env.NODE_ENV || 'development';

module.exports = {
  env,
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
