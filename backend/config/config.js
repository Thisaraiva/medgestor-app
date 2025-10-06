// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\config\config.js

require('dotenv').config();

// Configuração Base (DRY)
const baseConfig = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dialect: 'postgres',
};

module.exports = {
  development: {
    ...baseConfig, // Reutiliza a base
    database: process.env.DB_NAME || 'medgestor',
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
  },
  test: {
    ...baseConfig, // Reutiliza a base
    database: process.env.DB_NAME_TEST || 'medgestor_test',
    host: process.env.DB_HOST_TEST || 'db_test', // 'db_test' para rodar no Docker
    port: process.env.DB_PORT_TEST || 5432, // 5432 para rodar no Docker
  },
  production: {
    // Em produção, o usuário e senha podem ser diferentes (melhor segurança), por isso lemos PROD primeiro
    username: process.env.DB_USER_PROD || process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    database: process.env.DB_NAME_PROD || 'medgestor_prod',
    host: process.env.DB_HOST_PROD || 'db_prod',
    port: process.env.DB_PORT_PROD || 5432,
  },
};