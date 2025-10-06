// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\tests\test_setup.js

const sequelize = require('../config/database');
const { execSync } = require('child_process');
const path = require('path');
const { QueryTypes } = require('sequelize'); // Importar QueryTypes

// Adiciona o carregamento de variáveis de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Variáveis para o token de autenticação simulado (DRY)
const { generateToken } = require('../utils/jwt');

global.testAuthUser = {
    id: 'a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d', // ID UUID fixo para simulação
    role: 'doctor', // Permissão máxima para testes de integração
    name: 'Test Doctor',
    email: 'test@medgestor.com'
};
global.testAuthToken = generateToken(global.testAuthUser);

// Define o diretório raiz do backend para comandos NPM
const BACKEND_ROOT = path.resolve(__dirname, '..');

// Função para limpar todas as tabelas (RESETAR O DB)
const cleanupDatabase = async () => {
    // Esta função é específica para PostgreSQL. Adapte se estiver usando outro DB (ex: MySQL/MariaDB)
    // Para SQLite, usaríamos DROP TABLE IF EXISTS e depois sync.
    if (sequelize.options.dialect === 'postgres') {
        console.log('[TEST SETUP] Limpando todas as tabelas (PostgreSQL)...');
        // 1. Desliga checagens de FKs temporariamente para permitir TRUNCATE
        await sequelize.query('SET session_replication_role = replica;', { raw: true });

        // 2. Coleta nomes de todas as tabelas
        const tableNames = await sequelize.query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'sequelize_meta' AND tablename != 'sequelize_data'",
            { type: QueryTypes.SELECT, raw: true }
        ).then(results => results.map(r => r.tablename));

        if (tableNames.length > 0) {
            // 3. Executa TRUNCATE CASCADE em todas as tabelas (limpa dados e reseta sequências de ID)
            const truncateQuery = tableNames.map(name => `"${name}"`).join(', ');
            await sequelize.query(`TRUNCATE TABLE ${truncateQuery} RESTART IDENTITY CASCADE;`, { raw: true });
        }

        // 4. Liga checagens de FKs novamente
        await sequelize.query('SET session_replication_role = default;', { raw: true });
        console.log('[TEST SETUP] Limpeza de dados concluída.');
    } else {
        // Para outros Dialectos (ex: SQLite), use force sync ou limpeza manual por Model
        console.warn('[TEST SETUP] Limpeza de DB por TRUNCATE não implementada para este dialecto. Usando seeds com cautela.');
        // Em casos de teste real, a limpeza por Model.destroy({ truncate: true }) é mais portátil, 
        // mas o TRUNCATE via SQL é mais rápido.
    }
};

beforeAll(async () => {
    try {
        console.log('\n[TEST SETUP] Conectando ao Banco de Dados de Teste...');
        await sequelize.authenticate();

        // 1. Aplica Migrações (se necessário, na primeira vez)
        console.log('[TEST SETUP] Aplicando Migrações no DB de Teste...');
        execSync(`npm run migrate:test`, {
            cwd: BACKEND_ROOT,
            stdio: 'inherit'
        });

        // NOVO: LIMPEZA COMPLETA ANTES DE SEMEAR NOVAMENTE
        await cleanupDatabase();

        // 2. Popula o DB de Teste com dados iniciais (Seeds)
        console.log('[TEST SETUP] Aplicando Seeds no DB de Teste (Usuário para login)...');
        execSync(`npm run seed:test`, {
            cwd: BACKEND_ROOT,
            stdio: 'inherit'
        });

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