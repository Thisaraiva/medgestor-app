require('dotenv').config();
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'medgestor',
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
  },
  // backend\config\database.js
test: {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME_TEST || 'medgestor_test',
  host: process.env.DB_HOST_TEST || 'db_test', // Nome do serviço no docker-compose (mapeia para porta 5432 internamente)
  port: parseInt(process.env.DB_PORT_TEST, 10) || 5432, // Porta interna do contêiner, mapeada para 5433 no host
  dialect: 'postgres',
},
  production: {
    username: process.env.DB_USER_PROD || 'postgres',
    password: process.env.DB_PASSWORD_PROD || 'postgres',
    database: process.env.DB_NAME_PROD || 'medgestor_prod',
    host: process.env.DB_HOST_PROD || 'db_prod',
    port: parseInt(process.env.DB_PORT_PROD, 10) || 5432,
    dialect: 'postgres',
  },
}[env];


if (!config.database || !config.username || !config.host) {
  throw new Error('Missing required database configuration');
}

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: env === 'test' ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;