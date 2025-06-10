const request = require('supertest');
const app = require('../server');
const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

describe('Auth API', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'doctor',
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.user.email).toBe('test@example.com');
        expect(res.body.token).toBeDefined();
    });

    it('should login an existing user', async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Test User',
            email: 'login@example.com',
            password: hashedPassword,
            role: 'doctor',
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe('login@example.com');
        expect(res.body.token).toBeDefined();
    });
});