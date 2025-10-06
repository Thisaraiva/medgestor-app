// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\tests\integration\auth.integration.test.js

const request = require('supertest');
const app = require('../../server'); 
const { User } = require('../../models');

// Dados de teste (DRY)
const testUserData = {
    name: "Admin Teste",
    email: "admin.test@medgestor.com",
    password: "securePassword123",
    role: "admin",
    // CRM não é necessário para admin, mas se fosse doctor, precisaria.
};

describe('Auth API Endpoints', () => {
    // Garantimos que a tabela de usuários esteja limpa antes de cada teste
    beforeEach(async () => {
        // Limpar a tabela de Usuários antes de cada caso de teste
        // Isso é crucial para que o teste de 'registro' comece com um DB vazio.
        await User.destroy({ where: {}, truncate: true, cascade: true });
    });

    // Teste de Registro (POST /api/auth/register)
    test('Deve registrar um novo usuário com sucesso', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            // Nota: Se sua rota de registro for protegida, use o token global.testAuthToken aqui
            .send(testUserData);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(testUserData.email);
        expect(response.body).not.toHaveProperty('password'); // Nunca deve retornar a senha
    });

    // Teste de Registro (Email Duplicado)
    test('Não deve registrar com email duplicado', async () => {
        // 1. Registra o primeiro usuário
        await User.create(testUserData); 
        
        // 2. Tenta registrar novamente
        const response = await request(app)
            .post('/api/auth/register')
            .send(testUserData); 

        expect(response.statusCode).toBe(400); 
        expect(response.body.error).toBe('Email já registrado'); 
    });

    // Teste de Login (POST /api/auth/login)
    test('Deve permitir login de um usuário registrado e retornar token', async () => {
        // 1. Cria um usuário (o hook do model fará o hash da senha)
        await User.create(testUserData);

        // 2. Tenta fazer login
        const response = await request(app)
            .post('/api/auth/login')
            .send({ 
                email: testUserData.email, 
                password: testUserData.password 
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('role', 'admin');
        expect(typeof response.body.token).toBe('string');
    });

    // Teste de Login (Senha Incorreta)
    test('Não deve permitir login com senha incorreta', async () => {
        // 1. Cria um usuário
        await User.create(testUserData);

        // 2. Tenta fazer login com senha errada
        const response = await request(app)
            .post('/api/auth/login')
            .send({ 
                email: testUserData.email, 
                password: 'wrongPassword' 
            });

        expect(response.statusCode).toBe(404); // Baseado no seu authService que lança NotFoundError
        expect(response.body.error).toBe('Email ou senha inválidos');
    });
});