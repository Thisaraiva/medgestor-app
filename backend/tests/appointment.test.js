const request = require('supertest');
const { createTestServer } = require('./test_setup');
const { sequelize, User, Patient, Appointment } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

describe('Appointment API', () => {
  let app;
  let token;
  let doctor;
  let patient;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    app = createTestServer();
    await sequelize.sync({ force: true });

    doctor = await User.create({
      name: 'Test Doctor',
      email: 'doctor@example.com',
      password: await bcrypt.hash('password123', 1),
      role: 'doctor',
    });

    patient = await Patient.create({
      name: 'Test Patient',
      cpf: '123.456.789-00',
      email: 'patient@example.com',
    });

    token = generateToken({ id: doctor.id, role: 'doctor' });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it('should create a new appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: doctor.id,
        patientId: patient.id,
        date: '2023-06-20T10:00:00Z',
        type: 'initial',
        insurance: false,
      }).expect('Content-Type', /json/);
      expect(res.statusCode).toBe(201);
      expect(res.body.date).toBe('2023-06-20T10:00:00:00.000Z');
    });

    it('should fail with invalid date', async () => {
      const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: doctor.id,
        patientId: patient.id,
        date: '2023-01-01T00:00:00Z', // Data passada
        type: 'initial',
        insurance: false,
      }).expect('Content-Type', /json/);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Data deve ser futura');
    });

    it('should get all appointments', async () => {
      await Appointment.create({
        doctorId: doctor.id,
        patientId: patient.id,
        date: '2023-06-20T10:00:00Z',
        type: 'initial',
        insurance: false,
      });
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
      });

      it('should filter appointments by type', async () => {
        await Appointment.create({
          doctorId: doctor.id,
          patientId: patient.id,
          date: '2023-06-20T10:00:00Z',
          type: 'initial',
          insurance: false,
        });
        const res = await request(app)
        .get('/api/appointments?type=initial')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].type).toBe('initial');
      });
    });

module.exports = describe;