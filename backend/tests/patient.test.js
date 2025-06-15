const request = require('supertest');
const { createTestServer } = require('./test_setup');
const { sequelize, Patient, User } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

describe('Patient API', () => {
  let app;
  let secretaryToken;
  let doctorToken;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    app = createTestServer();
    await sequelize.sync({ force: true });

    const secretary = await User.create({
      name: 'Test Secretary',
      email: 'secretary@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'secretary',
    });
    const doctor = await User.create({
      name: 'Test Doctor',
      email: 'doctor@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      crm: 'CRM/SP-123456',
    });
    secretaryToken = generateToken({ id: secretary.id, role: 'secretary' });
    doctorToken = generateToken({ id: doctor.id, role: 'doctor' });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it('should create a new patient as secretary', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${secretaryToken}`)
      .send({
        name: 'Test Patient',
        cpf: '111.222.333-44',
        email: 'test.patient@example.com',
        phone: '(11) 91234-5678',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Patient');
    expect(res.body.cpf).toBe('111.222.333-44');
  });

  it('should fail to create patient as doctor', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        name: 'Test Patient',
        cpf: '111.222.333-44',
        email: 'test.patient@example.com',
        phone: '(11) 91234-5678',
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('permissão insuficiente');
  });

  it('should fail to create patient with invalid CPF', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${secretaryToken}`)
      .send({
        name: 'Test Patient',
        cpf: 'invalid-cpf',
        email: 'test.patient@example.com',
        phone: '(11) 91234-5678',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('CPF deve estar no formato');
  });

  it('should get patients by CPF filter', async () => {
    await Patient.create({
      name: 'Test Patient',
      cpf: '111.222.333-44',
      email: 'test.patient@example.com',
      phone: '(11) 91234-5678',
    });
    const res = await request(app)
      .get('/api/patients?cpf=111.222.333-44')
      .set('Authorization', `Bearer ${secretaryToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].cpf).toBe('111.222.333-44');
  });
});

module.exports = describe;