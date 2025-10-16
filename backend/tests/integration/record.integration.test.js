const request = require('supertest');
const app = require('../../server');
const { MedicalRecord, /*User*/ } = require('../../models');
//const { generateToken } = require('../../utils/jwt');
const moment = require('moment-timezone');

const doctorAuthToken = global.testAuthToken; // Token do Doctor logado (global de test_setup)
const testPatientId = global.testPatientId; // ID do Patient seed (global)

const newRecordData = {
  patientId: testPatientId,
  appointmentId: null, // Opcional
  diagnosis: 'Test Diagnosis',
  treatment: 'Test Treatment',
  notes: 'Test Notes',
  date: moment.utc().toISOString(), // Data ISO válida
};

// Variáveis que serão preenchidas
let newRecordId;

describe('MedicalRecord API Endpoints', () => {

  // Removido beforeAll/afterAll para admin/secretary, pois não usados

  beforeEach(async () => {
    const newRecord = await MedicalRecord.create(newRecordData);
    newRecordId = newRecord.id;
  });

  afterEach(async () => {
    await MedicalRecord.destroy({ where: { id: newRecordId }, cascade: true });
  });

  // 1. Testes de Leitura (GET /by-patient/:patientId e /:id)
  describe('GET /api/records/by-patient/:patientId', () => {
    test('Deve listar todos os registros de um paciente com sucesso (Autenticação Doctor)', async () => {
      const response = await request(app)
        .get(`/api/records/by-patient/${testPatientId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1); // Seeds + teste
      expect(response.body.some(r => r.diagnosis === newRecordData.diagnosis)).toBe(true);
    });

    test('Deve filtrar registros por data com sucesso', async () => {
      const startDate = moment.utc().subtract(1, 'day').toISOString();
      const endDate = moment.utc().add(1, 'day').toISOString();

      const response = await request(app)
        .get(`/api/records/by-patient/${testPatientId}`)
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Deve retornar 404 para paciente inexistente', async () => {
      const response = await request(app)
        .get('/api/records/by-patient/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Paciente não encontrado');
    });
  });

  describe('GET /api/records/:id', () => {
    test('Deve retornar um registro por ID com sucesso', async () => {
      const response = await request(app)
        .get(`/api/records/${newRecordId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(newRecordId);
      expect(response.body.diagnosis).toBe(newRecordData.diagnosis);
    });

    test('Deve retornar 404 para ID inválido', async () => {
      const response = await request(app)
        .get('/api/records/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Registro médico não encontrado');
    });
  });

  // 2. Testes de Criação (POST /api/records)
  describe('POST /api/records', () => {
    test('Doctor deve criar um novo registro com sucesso', async () => {
      const createData = {
        patientId: testPatientId,
        diagnosis: 'New Diagnosis',
        treatment: 'New Treatment',
        notes: 'New Notes',
        date: moment.utc().toISOString(),
      };

      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${doctorAuthToken}`)
        .send(createData);

      expect(response.statusCode).toBe(201);
      expect(response.body.diagnosis).toBe(createData.diagnosis);

      // Limpeza
      await MedicalRecord.destroy({ where: { id: response.body.id } });
    });

    test('Deve retornar 400 para data inválida', async () => {
      const createData = {
        ...newRecordData,
        date: 'invalid-date',
      };

      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${doctorAuthToken}`)
        .send(createData);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('Data deve estar no formato ISO 8601 (ex: AAAA-MM-DDTHH:mm:ss.sssZ)');
    });

    test('Deve retornar 404 para paciente inexistente', async () => {
      const createData = {
        ...newRecordData,
        patientId: '00000000-0000-0000-0000-000000000000',
      };

      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${doctorAuthToken}`)
        .send(createData);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Paciente não encontrado');
    });
  });

  // 3. Testes de Atualização (PUT /api/records/:id)
  describe('PUT /api/records/:id', () => {
    test('Doctor deve atualizar um registro com sucesso', async () => {
      const updateData = { diagnosis: 'Updated Diagnosis', notes: 'Updated Notes' };

      const response = await request(app)
        .put(`/api/records/${newRecordId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.diagnosis).toBe(updateData.diagnosis);
    });

    test('Deve retornar 404 para ID inválido', async () => {
      const updateData = { diagnosis: 'Invalid Update' };

      const response = await request(app)
        .put('/api/records/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${doctorAuthToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Registro médico não encontrado.');
    });
  });

  // 4. Testes de Exclusão (DELETE /api/records/:id)
  describe('DELETE /api/records/:id', () => {
    test('Doctor deve excluir um registro com sucesso', async () => {
      const response = await request(app)
        .delete(`/api/records/${newRecordId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(204);

      const check = await MedicalRecord.findByPk(newRecordId);
      expect(check).toBeNull();
    });

    test('Deve retornar 404 para ID inválido', async () => {
      const response = await request(app)
        .delete('/api/records/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Registro médico não encontrado.');
    });
  });
});