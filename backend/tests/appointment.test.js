const request = require('supertest');
const { createTestServer } = require('./test_setup');
const { User, Patient, Appointment } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Appointment API', () => {
  let app;
  let token;
  let doctor;
  let patient;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = createTestServer();
    doctor = await User.findOne({ where: { role: 'doctor' } });
    patient = await Patient.findOne();
    token = generateToken({ id: doctor.id, role: 'doctor' });
  });

  it('should create a new appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: doctor.id,
        patientId: patient.id,
        date: '2025-06-20T10:00:00Z',
        type: 'initial',
        insurance: false,
      })
      .expect('Content-Type', /json/)
      .expect(201);
    expect(new Date(res.body.date).toISOString()).toMatch(/2025-06-20T10:00:00Z/);
  });

  it('should fail with invalid date', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: doctor.id,
        patientId: patient.id,
        date: '2025-06-16T10:00:00Z',
        type: 'initial',
        insurance: false,
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.error).toBe("\"date\" must be greater than \"now\"");
  });

  it('should get all appointments', async () => {
    await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      date: '2025-06-18T10:00:00Z',
      type: 'initial',
      insurance: false,
    });
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should filter appointments by type', async () => {
    await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      date: '2025-06-18T10:00:00Z',
      type: 'initial',
      insurance: false,
    });
    const res = await request(app)
      .get('/api/appointments?type=initial')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].type).toBe('initial');
  });
});