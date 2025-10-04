// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\tests\test_setup.js

const sequelize = require('../config/database');
const { execSync } = require('child_process');
const path = require('path');

// Adiciona o carregamento de variáveis de ambiente para garantir que
// JWT_SECRET esteja disponível para generateToken.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Variáveis para o token de autenticação simulado (DRY)
const { generateToken } = require('../utils/jwt');

// Criamos um token JWT válido baseado nas chaves de ambiente
global.testAuthUser = { 
    id: 'a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d', // ID UUID fixo para simulação
    role: 'doctor', // Permissão máxima para testes de integração
    name: 'Test Doctor', 
    email: 'test@medgestor.com' 
};
global.testAuthToken = generateToken(global.testAuthUser);

// Define o diretório raiz do backend para comandos NPM
const BACKEND_ROOT = path.resolve(__dirname, '..');


beforeAll(async () => {
    // 1. Conecta ao DB de Teste
    try {
        console.log('\n[TEST SETUP] Conectando ao Banco de Dados de Teste...');
        await sequelize.authenticate();
        
        // 2. Garante que o DB de Teste está migrado
        console.log('[TEST SETUP] Aplicando Migrações no DB de Teste...');
        
        // Usamos npm run migrate:test (já definido no package.json)
        // Definimos cwd para garantir que o comando seja executado na pasta backend
        execSync(`npm run migrate:test`, { 
            cwd: BACKEND_ROOT, 
            stdio: 'inherit' 
        });
        
        // 3. (Opcional) Popula o DB de Teste com dados iniciais (usuário administrador, etc.)
        console.log('[TEST SETUP] Aplicando Seeds no DB de Teste (Usuário para login)...');
        execSync(`npm run seed:test`, { 
            cwd: BACKEND_ROOT, 
            stdio: 'inherit' 
        });

        console.log('[TEST SETUP] Setup do DB de Teste concluído com sucesso.');

    } catch (error) {
        // Se a migração falhar (ex: DB não acessível), o erro será capturado aqui.
        console.error('[TEST SETUP ERROR] Erro ao configurar o DB de Teste:');
        console.error(error.message);
        // Removemos o process.exit(1) para que o Jest possa mostrar a saída completa
        // ou, idealmente, lançamos um erro para o Jest parar corretamente.
        throw new Error('Falha no setup do ambiente de teste. Verifique a conexão com o DB e as migrações.');
    }
});

afterAll(async () => {
    console.log('\n[TEST TEARDOWN] Fechando conexão com o Banco de Dados de Teste...');
    // Opcional: Desfazer seeds após todos os testes
    // Opcional: Desfazer migrações (se for necessário)
    await sequelize.close();
});