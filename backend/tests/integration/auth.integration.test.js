const request = require('supertest');
const { createTestServer } = require('../test_setup');
const { sequelize, User } = require('../../models');
const bcryptjs = require('bcryptjs');
const { generateToken } = require('../../utils/jwt');
const { v4: uuidv4 } = require('uuid');

jest.setTimeout(10000);

describe('Auth Integration Tests', () => {
  let app;
  let adminToken;

  beforeAll(async () => {
    jest.setTimeout(15000);
    app = createTestServer();
    // Usar seeders existentes
    const admin = await User.findOne({ where: { email: 'Callie_Hane94@medgestor.com' } });
    if (!admin) {
      throw new Error('Admin user from seeder not found');
    }
    adminToken = generateToken({ id: admin.id, role: admin.role });
  });

  beforeEach(async () => {
    // Limpar apenas usuários não-seed
    await User.destroy({ where: { email: { [sequelize.Op.notIn]: ['Callie_Hane94@medgestor.com'] } } });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a doctor successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. John',
          email: 'john@example.com',
          password: 'pass123',
          role: 'doctor',
          crm: 'CRM/SP-123456',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('john@example.com');
      expect(response.body.user.role).toBe('doctor');
      expect(response.body.token).toBeDefined();
    });

    it('should register a secretary without CRM', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'pass123',
          role: 'secretary',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('jane@example.com');
      expect(response.body.user.role).toBe('secretary');
      expect(response.body.user.crm).toBeNull();
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. John',
          email: 'invalid',
          password: 'pass123',
          role: 'doctor',
          crm: 'CRM/SP-123456',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('email must be a valid email');
    });

    it('should return 400 for missing CRM for doctor', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. John',
          email: 'john@example.com',
          password: 'pass123',
          role: 'doctor',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('CRM is required for doctors');
    });

    it('should return 400 for invalid CRM format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. John',
          email: 'john@example.com',
          password: 'pass123',
          role: 'doctor',
          crm: '12345',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('CRM must be in the format CRM/UF-XXXXXX');
    });

    it('should return 400 for existing email', async () => {
      await User.create({
        id: uuidv4(),
        name: 'Dr. John',
        email: 'john@example.com',
        password: await bcryptjs.hash('pass123', 10),
        role: 'doctor',
        crm: 'CRM/SP-123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Jane',
          email: 'john@example.com',
          password: 'pass123',
          role: 'doctor',
          crm: 'CRM/SP-654321',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email já registrado');
    });

    it('should return 403 for non-admin user', async () => {
      const doctor = await User.create({
        id: uuidv4(),
        name: 'Dr. John',
        email: 'john@example.com',
        password: await bcryptjs.hash('pass123', 10),
        role: 'doctor',
        crm: 'CRM/SP-123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const nonAdminToken = generateToken({ id: doctor.id, role: doctor.role });

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'pass123',
          role: 'secretary',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Acesso negado: permissão insuficiente');
    });

    it('should return 401 for no token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Dr. John',
          email: 'john@example.com',
          password: 'pass123',
          role: 'doctor',
          crm: 'CRM/SP-123456',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Acesso negado, token não fornecido');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      await User.create({
        id: uuidv4(),
        name: 'Dr. John',
        email: 'john@example.com',
        password: await bcryptjs.hash('pass123', 10),
        role: 'doctor',
        crm: 'CRM/SP-123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'pass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('john@example.com');
      expect(response.body.user.role).toBe('doctor');
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'pass123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('email must be a valid email');
    });

    it('should return 400 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'pass123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Credenciais inválidas');
    });

    it('should return 400 for invalid password', async () => {
      await User.create({
        id: uuidv4(),
        name: 'Dr. John',
        email: 'john@example.com',
        password: await bcryptjs.hash('pass123', 10),
        role: 'doctor',
        crm: 'CRM/SP-123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrong-password',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Credenciais inválidas');
    });
  });
});