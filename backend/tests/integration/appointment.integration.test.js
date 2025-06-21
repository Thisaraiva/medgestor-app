const request = require('supertest');
const { createTestServer } = require('../test_setup');
const { User, Patient, Appointment } = require('../../models');
const { generateToken } = require('../../utils/jwt');
const { format, addDays, subDays } = require('date-fns');
const { ptBR } = require('date-fns/locale');

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

  beforeEach(async () => {
    await Appointment.truncate({ cascade: true });
  });

  it('should create a new appointment', async () => {
    const futureDate = format(addDays(new Date(), 1), 'dd/MM/yyyy HH:mm');
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: doctor.id,
        patientId: patient.id,
        date: futureDate,
        type: 'return',
        insurance: false,
      })
      .expect('Content-Type', /json/)
      .expect(201);
    expect(res.body.date).toBe(futureDate);
    expect(res.body.doctorId).toBe(doctor.id);
    expect(res.body.patientId).toBe(patient.id);
  });

  it('should fail with invalid date', async () => {
    const pastDate = format(subDays(new Date(), 1), 'dd/MM/yyyy HH:mm');
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: doctor.id,
        patientId: patient.id,
        date: pastDate,
        type: 'return',
        insurance: false,
      })
      .expect('Content-Type', /json/)
      .expect(400);
    expect(res.body.error).toBe('Data deve ser futura');
  });

  it('should get all appointments', async () => {
    const futureDate = addDays(new Date(), 1);
    const formattedDate = format(futureDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      date: futureDate,
      type: 'return',
      insurance: false,
    });
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].date).toBe(formattedDate);
    expect(res.body[0].doctor.id).toBe(doctor.id);
    expect(res.body[0].patient.id).toBe(patient.id);
  });

  it('should filter appointments by type', async () => {
    const futureDate = addDays(new Date(), 1);
    const formattedDate = format(futureDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      date: futureDate,
      type: 'return',
      insurance: false,
    });
    const res = await request(app)
      .get('/api/appointments?type=return')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].type).toBe('return');
    expect(res.body[0].date).toBe(formattedDate);
  });

  it('should get appointment by id', async () => {
    const futureDate = addDays(new Date(), 1);
    const formattedDate = format(futureDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const appointment = await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      date: futureDate,
      type: 'return',
      insurance: false,
    });
    const res = await request(app)
      .get(`/api/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res.body.date).toBe(formattedDate);
    expect(res.body.id).toBe(appointment.id);
  });

  it('should update an appointment', async () => {
    const futureDate = addDays(new Date(), 1);
    const newFutureDate = addDays(new Date(), 2);
    const formattedNewDate = format(newFutureDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const appointment = await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      date: futureDate,
      type: 'return',
      insurance: false,
    });
    const res = await request(app)
      .put(`/api/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: formattedNewDate,
        type: 'initial',
      })
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res.body.date).toBe(formattedNewDate);
    expect(res.body.type).toBe('initial');
  });

  it('should delete an appointment', async () => {
    const futureDate = addDays(new Date(), 1);
    const appointment = await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      date: futureDate,
      type: 'return',
      insurance: false,
    });
    await request(app)
      .delete(`/api/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    const deleted = await Appointment.findByPk(appointment.id);
    expect(deleted).toBeNull();
  });
});