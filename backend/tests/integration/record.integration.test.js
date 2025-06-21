const request = require('supertest');
const { createTestServer } = require('../test_setup');
const { User, Patient, MedicalRecord } = require('../../models');
const { generateToken } = require('../../utils/jwt');

describe('Medical Record API', () => {
  let app;
  let doctorToken;
  let patient;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = createTestServer();
    const doctor = await User.findOne({ where: { role: 'doctor' } });
    patient = await Patient.findOne();
    if (!doctor || !patient) {
      throw new Error('Doctor or patient not found in seed data');
    }
    doctorToken = generateToken({ id: doctor.id, role: 'doctor' });
  });

  it('should create a new medical record', async () => {
    const recordData = {
      patientId: patient.id,
      diagnosis: 'Gripe',
      treatment: 'Repouso e hidratação',
      notes: 'Monitorar febre',
      date: new Date().toISOString(),
    };
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(recordData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body.diagnosis).toBe('Gripe');
    expect(res.body.patientId).toBe(patient.id);
  });

  it('should get records by patient', async () => {
    const recordData = {
      patientId: patient.id,
      diagnosis: 'Gripe',
      treatment: 'Repouso e hidratação',
      notes: 'Monitorar febre',
      date: new Date(),
    };
    await MedicalRecord.create(recordData);
    const res = await request(app)
      .get(`/api/records/patient/${patient.id}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].diagnosis).toBe('Gripe');
  });

  it('should get record by id', async () => {
    const recordData = {
      patientId: patient.id,
      diagnosis: 'Gripe',
      treatment: 'Repouso e hidratação',
      notes: 'Monitorar febre',
      date: new Date(),
    };
    const record = await MedicalRecord.create(recordData);
    const res = await request(app)
      .get(`/api/records/${record.id}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.diagnosis).toBe('Gripe');
    expect(res.body.id).toBe(record.id);
  });
});