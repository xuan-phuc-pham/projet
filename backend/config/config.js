require('dotenv').config();
require('dotenv').config({ path: '../.env' });

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME || 'user',
    "password": process.env.DB_PASSWORD || 'password',
    "database": process.env.DB_NAME || 'mydatabase',
    "host": process.env.DB_HOST || 'localhost',
    "dialect": "postgres"
  },
  "test": {
    "username": process.env.DB_USERNAME || 'user',
    "password": process.env.DB_PASSWORD || 'password',
    "database": process.env.DB_NAME || 'mydatabase',
    "host": process.env.DB_HOST || 'localhost',
    "dialect": "postgres"
  },
  // "production": {
  //   "username": "root",
  //   "password": null,
  //   "database": "database_production",
  //   "host": "127.0.0.1",
  //   "dialect": "postgres"
  // }
}