require('dotenv').config();
require('dotenv').config({ path: '../.env' });

module.exports = {
  // On a deux env mais le meme config
  "development": {
    "username": process.env.DB_USERNAME || 'user',
    "password": process.env.DB_PASSWORD || 'password',
    "database": process.env.DB_NAME || 'mydatabase',
    "host": process.env.DB_HOST || 'localhost',
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.DB_USERNAME || 'user',
    "password": process.env.DB_PASSWORD || 'password',
    "database": process.env.DB_NAME || 'mydatabase',
    "host": process.env.DB_HOST || 'localhost',
    "dialect": "postgres"
  },
}