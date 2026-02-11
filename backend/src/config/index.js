require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

module.exports = {
  env,
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || '',
};
