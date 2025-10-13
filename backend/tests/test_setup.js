const sequelize = require('../config/database');
const { execSync } = require('child_process');
const path = require('path');
const { QueryTypes } = require('sequelize');
const { generateToken } = require('../utils/jwt');
const { User } = require('../models');
const bcrypt = require('bcryptjs'); // Importar o bcrypt para hashear a senha (Melhor Prática)

const { DOCTOR_USER_ID } = require('../seeders/01_seed_users');
const { JANE_DOE_PATIENT_ID } = require('../seeders/02_seed_patient');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const TEST_PASSWORD = 'password123';

global.testAuthUser = {

    id: DOCTOR_USER_ID, // **CORREÇÃO: Usa o ID Fixo do Seed**
    role: 'doctor',
    name: 'Dr. John Smith', // Nome consistente com a seed
    email: 'doctor@medgestor.com', // Email consistente com a seed
    crm: 'CRM/SP-123456',
    password: TEST_PASSWORD
};

global.testAuthToken = generateToken({ id: global.testAuthUser.id, role: global.testAuthUser.role });
global.testPatientId = JANE_DOE_PATIENT_ID; // **CORREÇÃO: Usa o ID Fixo do Seed**
global.testPatientData = {
    id: global.testPatientId,
    name: "Jane Doe", // Nome consistente com a seed
    cpf: "123.456.789-09", // CPF consistente com a seed
    dateOfBirth: "1990-05-15",
    email: "patient@medgestor.com",
    phone: "(11) 91234-5678",
    allergies: null
};

const BACKEND_ROOT = path.resolve(__dirname, '..');

const cleanupDatabase = async () => {
    if (sequelize.options.dialect === 'postgres') {
        console.log('[TEST SETUP] Limpando todas as tabelas (PostgreSQL)...');
        await sequelize.query('SET session_replication_role = replica;', { raw: true });
        const tableNames = await sequelize.query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'sequelize_meta' AND tablename != 'sequelize_data'",
            { type: QueryTypes.SELECT, raw: true }
        ).then(results => results.map(r => r.tablename));

        if (tableNames.length > 0) {
            const truncateQuery = tableNames.map(name => `"${name}"`).join(', ');
            await sequelize.query(`TRUNCATE TABLE ${truncateQuery} RESTART IDENTITY CASCADE;`, { raw: true });
        }

        await sequelize.query('SET session_replication_role = default;', { raw: true });
        console.log('[TEST SETUP] Limpeza de dados concluída.');
    } else {
        console.warn('[TEST SETUP] Limpeza de DB por TRUNCATE não implementada para este dialecto. Usando seeds com cautela.');
    }
};

beforeAll(async () => {
    try {
        console.log('\n[TEST SETUP] Conectando ao Banco de Dados de Teste...');
        await sequelize.authenticate();
        console.log('[TEST SETUP] Aplicando Migrações no DB de Teste...');
        execSync(`npm run migrate:test`, {
            cwd: BACKEND_ROOT,
            stdio: 'inherit'
        });
        await cleanupDatabase();
        console.log('[TEST SETUP] Aplicando Seeds no DB de Teste...');
        execSync(`npm run seed:test`, {
            cwd: BACKEND_ROOT,
            stdio: 'inherit'
        });
        // **Ajuste:** Para garantir que a senha do usuário de teste esteja hasheada
        const userToUpdate = await User.findByPk(global.testAuthUser.id);
        if (userToUpdate && userToUpdate.password === TEST_PASSWORD) {
            userToUpdate.password = await bcrypt.hash(TEST_PASSWORD, 10);
            await userToUpdate.save({ fields: ['password'], hooks: false });
        }
        console.log('[TEST SETUP] Setup do DB de Teste concluído com sucesso.');
    } catch (error) {
        console.error('[TEST SETUP ERROR] Erro ao configurar o DB de Teste:');
        console.error(error.message);
        throw new Error('Falha no setup do ambiente de teste. Verifique a conexão com o DB e as migrações.');
    }
});
afterAll(async () => {
    console.log('\n[TEST TEARDOWN] Fechando conexão com o Banco de Dados de Teste...');
    await sequelize.close();
});