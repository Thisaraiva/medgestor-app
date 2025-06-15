const request = require('supertest');
const { createTestServer } = require('./test_setup');
const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

describe('Auth API', () => {
  let app;
  let adminToken;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    app = createTestServer();
    await sequelize.sync({ force: true });

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'admin',
    });
    adminToken = generateToken({ id: admin.id, role: 'admin' });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it('should register a new user as admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.token).toBeDefined();
  });

  it('should fail to register with duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      });
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'password123',
        role: 'doctor',
        crm: 'CRM/SP-654321',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Email já registrado');
  });

  it('should login an existing user', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Test User',
      email: 'login@example.com',
      password: hashedPassword,
      role: 'doctor',
      crm: 'CRM/SP-123456',
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

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Credenciais inválidas');
  });
});

module.exports = describe;