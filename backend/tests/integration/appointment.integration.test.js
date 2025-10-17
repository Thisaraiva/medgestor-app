const request = require('supertest');
const app = require('../../server');
const { Appointment, User, /*Patient,*/ InsurancePlan } = require('../../models');
const { generateToken } = require('../../utils/jwt');
const moment = require('moment-timezone');

// Mock do email para evitar falhas reais em testes
jest.mock('../../utils/email', () => ({
  sendAppointmentConfirmation: jest.fn().mockResolvedValue(undefined),
}));

const doctorAuthToken = global.testAuthToken; // Token do Doctor logado (global de test_setup)
const doctorId = global.testAuthUser.id; // ID do Doctor (global)
const testPatientId = global.testPatientId; // ID do Patient seed (global)

const secretaryData = {
  name: 'Test Secretary',
  email: 'test.secretary@medgestor.com',
  password: 'password123',
  role: 'secretary',
  crm: null,
};

const newAppointmentData = {
  doctorId: doctorId,
  patientId: testPatientId,
  date: moment.utc().add(1, 'days').set({ hour: 10, minute: 0 }).toISOString(), // Futura
  type: 'initial',
  insurance: false,
  insurancePlanId: null,
};

// Variáveis que serão preenchidas
let secretaryUser;
let secretaryToken;
let newAppointmentId;
let testInsurancePlanId;

describe('Appointment API Endpoints', () => {

  beforeAll(async () => {
    secretaryUser = await User.create(secretaryData);
    secretaryToken = generateToken({ id: secretaryUser.id, role: secretaryUser.role });

    // Criar um insurancePlan temp para testes com insurance true
    const testPlan = await InsurancePlan.create({
      name: 'Test Plan for Appointment',
      description: 'Temp plan',
      isActive: true,
    });
    testInsurancePlanId = testPlan.id;
  });

  afterAll(async () => {
    await User.destroy({ where: { id: secretaryUser.id }, cascade: true });
    await InsurancePlan.destroy({ where: { id: testInsurancePlanId }, cascade: true });
  });

  beforeEach(async () => {
    const newAppointment = await Appointment.create(newAppointmentData);
    newAppointmentId = newAppointment.id;
  });

  afterEach(async () => {
    await Appointment.destroy({ where: { id: newAppointmentId }, cascade: true });
  });

  // 1. Testes de Leitura (GET /api/appointments e /:id)
  describe('GET /api/appointments', () => {
    test('Deve listar todos os agendamentos com sucesso (Secretary - todos)', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${secretaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1); // Seeds + teste
      expect(response.body.some(a => a.type === newAppointmentData.type)).toBe(true);
    });

    test('Doctor deve listar apenas seus próprios agendamentos', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.every(a => a.doctor.id === doctorId)).toBe(true);
    });

    test('Deve filtrar por data com sucesso', async () => {
      const startDate = moment.utc().toISOString();
      const endDate = moment.utc().add(7, 'days').toISOString();

      const response = await request(app)
        .get('/api/appointments')
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${secretaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/appointments/:id', () => {
    test('Deve retornar um agendamento por ID com sucesso', async () => {
      const response = await request(app)
        .get(`/api/appointments/${newAppointmentId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(newAppointmentId);
      expect(response.body.type).toBe(newAppointmentData.type);
    });

    test('Deve retornar 404 para ID inválido', async () => {
      const response = await request(app)
        .get('/api/appointments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Consulta não encontrada.');
    });
  });

  // 2. Testes de Criação (POST /api/appointments)
  describe('POST /api/appointments', () => {
    test('Deve criar um novo agendamento sem seguro com sucesso', async () => {
      const createData = {
        doctorId: doctorId,
        patientId: testPatientId,
        date: moment.utc().add(2, 'days').set({ hour: 11, minute: 0 }).toISOString(),
        type: 'return',
        insurance: false,
        insurancePlanId: null,
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${secretaryToken}`)
        .send(createData);

      expect(response.statusCode).toBe(201);
      expect(response.body.type).toBe(createData.type);

      // Limpeza
      await Appointment.destroy({ where: { id: response.body.id } });
    });

    test('Deve criar um agendamento com seguro com sucesso', async () => {
      const createData = {
        doctorId: doctorId,
        patientId: testPatientId,
        date: moment.utc().add(3, 'days').set({ hour: 12, minute: 0 }).toISOString(),
        type: 'initial',
        insurance: true,
        insurancePlanId: testInsurancePlanId,
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${secretaryToken}`)
        .send(createData);

      expect(response.statusCode).toBe(201);
      expect(response.body.insurance).toBe(true);

      // Limpeza
      await Appointment.destroy({ where: { id: response.body.id } });
    });

    test('Deve retornar 400 para data passada', async () => {
      const createData = {
        ...newAppointmentData,
        date: moment.utc().subtract(1, 'days').toISOString(),
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${secretaryToken}`)
        .send(createData);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('data e hora da consulta devem ser futuras');
    });

    test('Deve retornar 400 para conflito de horário', async () => {
      const createData = {
        ...newAppointmentData,
        date: newAppointmentData.date, // Mesma hora do existing no beforeEach
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${secretaryToken}`)
        .send(createData);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('Médico já possui um agendamento neste horário');
    });

    test('Deve retornar 404 para doctor inexistente', async () => {
      const createData = {
        ...newAppointmentData,
        doctorId: '00000000-0000-0000-0000-000000000000',
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${secretaryToken}`)
        .send(createData);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toContain('Médico não encontrado');
    });
  });

  // 3. Testes de Atualização (PUT /api/appointments/:id)
  describe('PUT /api/appointments/:id', () => {
    test('Deve atualizar um agendamento com sucesso', async () => {
      const updateData = {
        type: 'return',
        insurance: true,
        insurancePlanId: testInsurancePlanId,
      };

      const response = await request(app)
        .put(`/api/appointments/${newAppointmentId}`)
        .set('Authorization', `Bearer ${secretaryToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.type).toBe(updateData.type);
      expect(response.body.insurance).toBe(true);
    });

    test('Deve retornar 400 para conflito de horário em update', async () => {
      // Criar um conflito temp
      const conflictData = {
        doctorId: doctorId,
        patientId: testPatientId,
        date: moment.utc().add(4, 'days').set({ hour: 13, minute: 0 }).toISOString(),
        type: 'initial',
        insurance: false,
      };
      const conflictAppointment = await Appointment.create(conflictData);

      const updateData = {
        date: conflictData.date, // Conflito
      };

      const response = await request(app)
        .put(`/api/appointments/${newAppointmentId}`)
        .set('Authorization', `Bearer ${secretaryToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('Médico já possui um agendamento neste horário');

      // Limpeza
      await Appointment.destroy({ where: { id: conflictAppointment.id } });
    });

    test('Deve retornar 404 para ID inválido', async () => {
      const updateData = { type: 'return' }; // Type válido

      const response = await request(app)
        .put('/api/appointments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${secretaryToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Consulta não encontrada.');
    });
  });

  // 4. Testes de Exclusão (DELETE /api/appointments/:id)
  describe('DELETE /api/appointments/:id', () => {
    test('Deve excluir um agendamento com sucesso', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${newAppointmentId}`)
        .set('Authorization', `Bearer ${secretaryToken}`);

      expect(response.statusCode).toBe(204);

      const check = await Appointment.findByPk(newAppointmentId);
      expect(check).toBeNull();
    });

    test('Deve retornar 404 para ID inválido', async () => {
      const response = await request(app)
        .delete('/api/appointments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${secretaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Consulta não encontrada.');
    });
  });
});