// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\tests\integration\patient.integration.test.js

const request = require('supertest');
const app = require('../../server'); 
const { Patient } = require('../../models');

// **MOCK DO AUTH MIDDLEWARE:**
// Isso instrui o Jest a usar o arquivo em middleware/__mocks__/authMiddleware.js
jest.mock('../../middleware/authMiddleware');

// Dados de teste para reutilização (DRY)
const patientData = {
    name: "Joao Teste Silva",
    cpf: "000.000.000-00", // Este CPF é matematicamente válido (000.000.000-00 e 000.000.000-01 são válidos)
    dateOfBirth: "1990-01-01",
    email: "joao.teste@exemplo.com",
    phone: "11998877665",
    allergies: "Nenhuma conhecida"
};

describe('Patient API Endpoints', () => {
    // Garante que a tabela de Pacientes esteja vazia antes do conjunto de testes
    beforeAll(async () => {
        // Limpar a tabela antes de tudo garante um estado inicial limpo
        await Patient.destroy({ where: {}, truncate: true, cascade: true });
    });

    // Garante que a tabela esteja vazia após cada teste para isolamento
    afterEach(async () => {
        await Patient.destroy({ where: {}, truncate: true, cascade: true });
    });

    // Teste de Criação (POST /api/patients)
    test('Deve criar um novo paciente com sucesso (com autenticação MOCK)', async () => {
        const response = await request(app)
            .post('/api/patients')
            // Passamos o token mockado que foi gerado no test_setup.js (DRY)
            .set('Authorization', `Bearer ${global.testAuthToken}`)
            .send(patientData);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(patientData.name);
        expect(response.body.cpf).toBe(patientData.cpf);
    });

    // Teste de Criação (Validação de CPF duplicado)
    test('Não deve criar um paciente com CPF duplicado', async () => {
        // 1. Cria o primeiro paciente
        await Patient.create(patientData);

        // 2. Tenta criar o segundo com o mesmo CPF
        const response = await request(app)
            .post('/api/patients')
            // Rota protegida deve ter o token:
            .set('Authorization', `Bearer ${global.testAuthToken}`) 
            .send(patientData);

        expect(response.statusCode).toBe(400); // 400 Bad Request
        // Observação: Sua controller/service deve lançar um erro com essa mensagem ou similar
        expect(response.body.error).toBe('O **CPF** fornecido já está registrado para outro paciente.'); 
    });

    // Teste de Leitura (GET /api/patients/:id)
    test('Deve retornar um paciente por ID', async () => {
        // 1. Cria um paciente para buscar
        const newPatient = await Patient.create(patientData);

        // 2. Busca o paciente
        const response = await request(app)
            .get(`/api/patients/${newPatient.id}`)
            .set('Authorization', `Bearer ${global.testAuthToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(newPatient.id);
        expect(response.body.name).toBe(newPatient.name);
    });

    // Teste de Atualização (PUT /api/patients/:id)
    test('Deve atualizar um paciente com sucesso', async () => {
        // 1. Cria um paciente
        const newPatient = await Patient.create(patientData);
        const updateData = { phone: "99999999999" };

        // 2. Atualiza o paciente
        const response = await request(app)
            .put(`/api/patients/${newPatient.id}`)
            .set('Authorization', `Bearer ${global.testAuthToken}`)
            .send(updateData);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Paciente atualizado com sucesso!');
        expect(response.body.patient.phone).toBe(updateData.phone);
    });

    // Teste de Exclusão (DELETE /api/patients/:id)
    test('Deve deletar um paciente com sucesso', async () => {
        // 1. Cria um paciente
        const newPatient = await Patient.create(patientData);

        // 2. Deleta o paciente
        const deleteResponse = await request(app)
            .delete(`/api/patients/${newPatient.id}`)
            .set('Authorization', `Bearer ${global.testAuthToken}`);

        expect(deleteResponse.statusCode).toBe(200);
        expect(deleteResponse.body.message).toBe('Paciente excluído com sucesso!');

        // 3. Verifica se foi realmente excluído
        const check = await Patient.findByPk(newPatient.id);
        expect(check).toBeNull();
    });
});