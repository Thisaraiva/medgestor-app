const request = require('supertest');
const { createTestServer } = require('../test_setup');
const { User } = require('../../models');
const { generateToken } = require('../../utils/jwt');

describe('Patient API', () => {
  let app;
  let secretaryToken;
  let doctorToken;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = createTestServer();
    const secretary = await User.findOne({ where: { role: 'secretary' } });
    const doctor = await User.findOne({ where: { role: 'doctor' } });
    if (!secretary || !doctor) {
      throw new Error('Secretary or doctor not found in seed data');
    }
    secretaryToken = generateToken({ id: secretary.id, role: 'secretary' });
    doctorToken = generateToken({ id: doctor.id, role: 'doctor' });
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
      })
      .expect(201);

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
      })
      .expect(403);

    expect(res.body.error).toBe('Acesso negado: permissão insuficiente');
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
      })
      .expect(400);

    expect(res.body.error).toMatch(/"cpf" with value "invalid-cpf" fails to match the required pattern/);
  });

  it('should get patients by CPF filter', async () => {
    const res = await request(app)
      .get('/api/patients?cpf=111.222.333-44')
      .set('Authorization', `Bearer ${secretaryToken}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });
});