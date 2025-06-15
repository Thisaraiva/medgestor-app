const request = require('supertest');
const { createTestServer } = require('./test_setup');
const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

describe('User API', () => {
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

  it('should create a doctor with valid CRM', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Doctor',
        email: 'doctor@example.com',
        password: 'password123',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('doctor');
    expect(res.body.user.email).toBe('doctor@example.com');
  });

  it('should fail to create doctor without CRM', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Doctor',
        email: 'doctor@example.com',
        password: 'password123',
        role: 'doctor',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('CRM is required');
  });

  it('should fail to create non-doctor with CRM', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Secretary',
        email: 'secretary@example.com',
        password: 'password123',
        role: 'secretary',
        crm: 'CRM/SP-123456',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('CRM must be null');
  });
});

module.exports = describe;