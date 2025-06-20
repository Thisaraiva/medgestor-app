const request = require('supertest');
const { createTestServer } = require('../test_setup');
const { User } = require('../../models');
const { generateToken } = require('../../utils/jwt');

describe('Auth API', () => {
  let app;
  let adminToken;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = createTestServer();
    const admin = await User.findOne({ where: { email: 'admin@medgestor.com' } });
    adminToken = generateToken({ id: admin.id, role: 'admin' });
  });

  it('should register a new user as admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass123',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      })
      .expect(201);

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
        password: 'pass123',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      });
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'pass123',
        role: 'doctor',
        crm: 'CRM/SP-654321',
      })
      .expect(400);

    expect(res.body.error).toContain('Email já registrado');
  });

  it('should fail to register without admin role', async () => {
    const doctorToken = generateToken({ id: 'uuid-doctor', role: 'doctor' });
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        name: 'Test User',
        email: 'test2@example.com',
        password: 'pass123',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      })
      .expect(403);

    expect(res.body.error).toBe('Acesso negado: permissão insuficiente');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@medgestor.com',
        password: 'pass123',
      })
      .expect(200);

    expect(res.body.user.email).toBe('admin@medgestor.com');
    expect(res.body.token).toBeDefined();
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@medgestor.com', password: 'wrongpassword' })
      .expect(400);

    expect(res.body.error).toContain('Credenciais inválidas');
  });

  it('should fail login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'pass123' })
      .expect(400);

    expect(res.body.error).toContain('Credenciais inválidas');
  });
});