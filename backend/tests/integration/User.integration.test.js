const request = require('supertest');
const app = require('../../server');
const { User } = require('../../models');
const { generateToken } = require('../../utils/jwt');

const doctorAuthToken = global.testAuthToken; // Token do Doutor logado
const doctorId = global.testAuthUser.id; // ID do Doutor logado

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

const newDoctorData = {
  name: 'Dr. New Test',
  email: 'dr.new@medgestor.com',
  password: 'password123',
  role: 'doctor',
  crm: 'CRM/RJ-789012',
};

// Variáveis que serão preenchidas
let adminUser;
let secretaryUser;
let adminToken;
let secretaryToken;
let newDoctorId;

describe('User API Endpoints', () => {

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
    const newDoctor = await User.create(newDoctorData);
    newDoctorId = newDoctor.id;
  });

  afterEach(async () => {
    await User.destroy({ where: { id: newDoctorId }, cascade: true });
  });

  // 1. Testes de Leitura (GET /api/users e /api/users/:id)
  describe('GET /api/users', () => {
    test('Deve listar todos os usuários com sucesso (Autenticação Doctor)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(4);
      expect(response.body.some(u => u.email === adminData.email)).toBe(true);
      expect(response.body[0]).not.toHaveProperty('password'); // SRP: Não expor senha
    });

    test('Deve retornar um usuário por ID com sucesso', async () => {
      const response = await request(app)
        .get(`/api/users/${newDoctorId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(newDoctorId);
      expect(response.body.name).toBe(newDoctorData.name);
    });

    // Teste de permissão (secretary pode acessar)
    test('Secretary deve poder listar usuários', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${secretaryToken}`); // Usa token do Secretary

      expect(response.statusCode).toBe(200);
    });
  });

  describe('PUT /api/users/:id (Alterar Outro Usuário)', () => {
    test('Admin deve atualizar o papel de um Doutor para Secretary com sucesso', async () => {
      const updateData = { role: 'secretary' };

      const response = await request(app)
        .put(`/api/users/${newDoctorId}`)
        .set('Authorization', `Bearer ${adminToken}`) // O token está sendo enviado
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Usuário atualizado com sucesso!');
      expect(response.body.user.role).toBe('secretary');
    });

    test('Doctor não deve conseguir atualizar o papel de outro usuário para Admin (403)', async () => {
      // Criamos um usuário temporário para o teste
      const targetUser = await User.create({ ...secretaryData, email: 'target@medgestor.com' });

      const updateData = { role: 'admin' };

      const response = await request(app)
        .put(`/api/users/${targetUser.id}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`) // Usando token Doctor
        .send(updateData);

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Apenas administradores podem alterar o papel de outros usuários.');

      await User.destroy({ where: { id: targetUser.id }, cascade: true });
    });
  });

  describe('PUT /api/users/profile/:id (Alterar Próprio Perfil)', () => {
    test('Doutor deve atualizar seu próprio nome com sucesso', async () => {
      const updateData = { name: 'Dr. John Smith Atualizado' };

      const response = await request(app)
        .put(`/api/users/profile/${doctorId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Perfil atualizado com sucesso!');
      expect(response.body.user.name).toBe(updateData.name);
    });

    test('Não deve permitir que Doutor atualize perfil de outro (403 - Autorização Controller)', async () => {
      const updateData = { name: 'Nome Invadido' };

      const response = await request(app)
        .put(`/api/users/profile/${newDoctorId}`) // ID do outro usuário
        .set('Authorization', `Bearer ${doctorAuthToken}`) // Token do Doctor logado
        .send(updateData);

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Você não tem permissão para editar este perfil.');
    });
  });

  // 4. Testes de Exclusão (DELETE /api/users/:id)
  describe('DELETE /api/users/:id', () => {
    test('Doutor deve conseguir excluir um Secretary com sucesso', async () => {
      const userToDelete = await User.create({ ...secretaryData, email: 'del.sec@medgestor.com' });

      const response = await request(app)
        .delete(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Usuário excluído com sucesso!');

      const check = await User.findByPk(userToDelete.id);
      expect(check).toBeNull();
    });

    test('Doctor não deve conseguir excluir a si mesmo (403)', async () => {
      const response = await request(app)
        .delete(`/api/users/${doctorId}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toContain('Você não pode excluir seu próprio usuário através desta rota');
    });

    test('Doctor não deve conseguir excluir um Admin (403)', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${doctorAuthToken}`);

      expect(response.statusCode).toBe(403);      
      expect(response.body.error).toBe('Apenas um administrador pode excluir outro administrador.');
    });
  });
});