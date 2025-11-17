// backend/config/config.js
require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER_PROD || process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD || 'postgres',
  dialect: 'postgres',
  logging: false,
};
//Teste
module.exports = {
  development: {
    ...baseConfig,
    database: process.env.DB_NAME || 'medgestor',
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
  },
  test: {
    ...baseConfig,
    database: process.env.DB_NAME_TEST || 'medgestor_test',
    host: process.env.DB_HOST_TEST || 'db_test',
    port: process.env.DB_PORT_TEST || 5432,
  },
  production: {
    ...baseConfig,
    database: process.env.DB_NAME_PROD || 'medgestor_db',
    host: process.env.DB_HOST_PROD || 'dpg-d47uk43ipnbc73d57950-a',
    port: process.env.DB_PORT_PROD || 5432,
  },
};