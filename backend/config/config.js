require('dotenv').config();

module.exports = {
    development: {
        database: process.env.DB_NAME || 'medgestor',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'db',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
    },
    test: {
        database: process.env.DB_NAME_TEST || 'medgestor_test',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST_TEST || 'db_test',
        port: process.env.DB_PORT_TEST || 5433,
        dialect: 'postgres',
    },
    production: {
        database: process.env.DB_NAME_PROD || process.env.DB_NAME,
        username: process.env.DB_USER_PROD || process.env.DB_USER,
        password: process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD,
        host: process.env.DB_HOST_PROD || process.env.DB_HOST,
        port: process.env.DB_PORT_PROD || process.env.DB_PORT,
        dialect: 'postgres',
    },
};