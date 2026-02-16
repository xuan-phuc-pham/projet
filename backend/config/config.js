require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || null,
    database: DB_NAME || "database_development",
    host: "127.0.0.1",
    dialect: "postgres"
  },
};