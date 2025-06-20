const request = require('supertest');
const { createTestServer } = require('../test_setup');
const { User, Patient, Appointment } = require('../../models');
const { generateToken } = require('../../utils/jwt');

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
    if (!doctor || !patient) {
      throw new Error('Doctor or patient not found in seed data');
    }
    token = generateToken({ id: doctor.id, role: 'doctor' });
  });

  it('should create a new appointment', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Data futura
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: doctor.id,
        patientId: patient.id,
        date: futureDate.toISOString(),
        type: 'initial',
        insurance: false,
      })
      .expect('Content-Type', /json/)
      .expect(201);
    expect(res.body.date).toBe(futureDate.toISOString());
  });

  it('should fail with invalid date', async () => {
    const pastDate = new Date('2025-06-16T10:00:00Z');
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: doctor.id,
        patientId: patient.id,
        date: pastDate.toISOString(),
        type: 'initial',
        insurance: false,
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.error).toBe('"date" must be greater than "now"');
  });

  it('should get all appointments', async () => {
    await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      date: new Date(Date.now() + 86400000).toISOString(), // +1 dia
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
      date: new Date(Date.now() + 86400000).toISOString(), // +1 dia
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