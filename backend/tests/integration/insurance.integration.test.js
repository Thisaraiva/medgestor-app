const request = require('supertest');
const app = require('../../server');
const { InsurancePlan, User } = require('../../models');
const { generateToken } = require('../../utils/jwt');

const doctorAuthToken = global.testAuthToken; // Token do Doctor logado (global de test_setup)

const adminData = {
  name: 'Test Admin',
  email: 'test.admin@medgestor.com',
  password: 'password123',
  role: 'admin',
  crm: null,
};

const secretaryData = {
  name: 'Test Secretary',
  email: 'test.secretary@medgestor.com',
  password: 'password123',
  role: 'secretary',
  crm: null,
};

const newPlanData = {
  name: 'Test Plan',
  description: 'A test insurance plan',
  isActive: true,
};

// Variáveis que serão preenchidas
let adminUser;
let secretaryUser;
let adminToken;
let secretaryToken;
let newPlanId;

describe('InsurancePlan API Endpoints', () => {

  beforeAll(async () => {
    adminUser = await User.create(adminData);
    secretaryUser = await User.create(secretaryData);

    // Geramos seus tokens
    adminToken = generateToken({ id: adminUser.id, role: adminUser.role });
    secretaryToken = generateToken({ id: secretaryUser.id, role: secretaryUser.role });
  });

  afterAll(async () => {
    await User.destroy({ where: { id: [adminUser.id, secretaryUser.id] }, cascade: true });
  });

  beforeEach(async () => {
    const newPlan = await InsurancePlan.create(newPlanData);
    newPlanId = newPlan.id;
  });

  afterEach(async () => {
    await InsurancePlan.destroy({ where: { id: newPlanId }, cascade: true });
  });

  // 1. Testes de Leitura (GET /api/insurance-plans, /active, /:id)
  describe('GET /api/insurance-plans', () => {
    test('Deve listar todos os planos de saúde com sucesso (Autenticação Doctor)', async () => {
      const response = await request(app)
        .get('/api/insurance-plans')
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(4); // Seeds + teste
      expect(response.body.some(p => p.name === newPlanData.name)).toBe(true);
    });

    test('Secretary deve poder listar todos os planos', async () => {
      const response = await request(app)
        .get('/api/insurance-plans')
        .set('Authorization', `Bearer ${secretaryToken}`);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/insurance-plans/active', () => {
    test('Deve listar apenas planos ativos com sucesso (Autenticação Doctor)', async () => {
      const response = await request(app)
        .get('/api/insurance-plans/active')
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every(p => p.isActive === true)).toBe(true); // Apenas ativos
    });
  });

  describe('GET /api/insurance-plans/:id', () => {
    test('Deve retornar um plano por ID com sucesso', async () => {
      const response = await request(app)
        .get(`/api/insurance-plans/${newPlanId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(newPlanId);
      expect(response.body.name).toBe(newPlanData.name);
    });

    test('Deve retornar 404 para ID inválido', async () => {
      const response = await request(app)
        .get('/api/insurance-plans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Plano de saúde não encontrado.');
    });
  });

  // 2. Testes de Criação (POST /api/insurance-plans)
  describe('POST /api/insurance-plans', () => {
    test('Admin deve criar um novo plano com sucesso', async () => {
      const createData = { name: 'New Admin Plan', description: 'Admin created' };

      const response = await request(app)
        .post('/api/insurance-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createData);

      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe(createData.name);

      // Limpeza
      await InsurancePlan.destroy({ where: { id: response.body.id } });
    });

    test('Secretary deve criar um novo plano com sucesso', async () => {
      const createData = { name: 'New Secretary Plan', description: 'Secretary created' };

      const response = await request(app)
        .post('/api/insurance-plans')
        .set('Authorization', `Bearer ${secretaryToken}`)
        .send(createData);

      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe(createData.name);

      // Limpeza
      await InsurancePlan.destroy({ where: { id: response.body.id } });
    });

    test('Doctor não deve conseguir criar um plano (403)', async () => {
      const createData = { name: 'Forbidden Plan' };

      const response = await request(app)
        .post('/api/insurance-plans')
        .set('Authorization', `Bearer ${doctorAuthToken}`)
        .send(createData);

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Acesso negado: permissão insuficiente');
    });

    test('Deve retornar 400 para nome duplicado', async () => {
      const createData = { name: newPlanData.name }; // Duplicado

      const response = await request(app)
        .post('/api/insurance-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createData);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('Já existe um convênio com este nome.');
    });
  });

  // 3. Testes de Atualização (PUT /api/insurance-plans/:id)
  describe('PUT /api/insurance-plans/:id', () => {
    test('Admin deve atualizar um plano com sucesso', async () => {
      const updateData = { name: 'Updated Plan', isActive: false };

      const response = await request(app)
        .put(`/api/insurance-plans/${newPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.isActive).toBe(false);
    });

    test('Doctor não deve conseguir atualizar um plano (403)', async () => {
      const updateData = { name: 'Forbidden Update' };

      const response = await request(app)
        .put(`/api/insurance-plans/${newPlanId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Acesso negado: permissão insuficiente');
    });
  });

  // 4. Testes de Exclusão (DELETE /api/insurance-plans/:id)
  describe('DELETE /api/insurance-plans/:id', () => {
    test('Admin deve excluir um plano com sucesso', async () => {
      const response = await request(app)
        .delete(`/api/insurance-plans/${newPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(204);

      const check = await InsurancePlan.findByPk(newPlanId);
      expect(check).toBeNull();
    });

    test('Doctor não deve conseguir excluir um plano (403)', async () => {
      const response = await request(app)
        .delete(`/api/insurance-plans/${newPlanId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Acesso negado: permissão insuficiente');
    });
  });
});