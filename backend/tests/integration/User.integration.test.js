/*const request = require('supertest');
const { createTestServer } = require('../test_setup');
const { User } = require('../../models');
const { generateToken } = require('../../utils/jwt');

describe('User API', () => {
  let app;
  let adminToken;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = createTestServer();
    const admin = await User.findOne({ where: { email: 'admin@medgestor.com' } });
    if (!admin) {
      throw new Error('Admin user not found in seed data');
    }
    adminToken = generateToken({ id: admin.id, role: 'admin' });
  });

  it('should create a doctor with valid CRM', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Doctor',
        email: 'doctor@example.com',
        password: 'pass123',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      })
      .expect(201);

    expect(res.body.user.role).toBe('doctor');
    expect(res.body.user.email).toBe('doctor@example.com');
  });

  it('should fail to create doctor without CRM', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Doctor',
        email: 'doctor2@example.com',
        password: 'pass123',
        role: 'doctor',
      })
      .expect(400);

    expect(res.body.error).toBe('"crm" is required');
  });

  it('should fail to create non-doctor with CRM', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Secretary',
        email: 'secretary@example.com',
        password: 'pass123',
        role: 'secretary',
        crm: 'CRM/SP-123456',
      })
      .expect(400);

    expect(res.body.error).toBe('"crm" is not allowed');
  });
});*/