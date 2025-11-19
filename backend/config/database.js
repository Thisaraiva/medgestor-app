// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\config\database.js

const { Sequelize } = require('sequelize');
const cliConfig = require('./config'); // Carrega as configurações do CLI

const env = process.env.NODE_ENV || 'development';

// Carrega a configuração específica do ambiente
const config = cliConfig[env];

// Garante que o port seja um número se estiver sendo lido como string
config.port = parseInt(config.port, 10);

if (!config.database || !config.username || !config.host) {
  throw new Error('Missing required database configuration');
}

// Configuração extra específica para o ORM (que não está no config.js)
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