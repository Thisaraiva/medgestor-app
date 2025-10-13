// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\tests\integration\patient.integration.test.js

const request = require('supertest');
const app = require('../../server');
const { Patient } = require('../../models');

// **MOCK DO AUTH MIDDLEWARE:**
// Isso instrui o Jest a usar o arquivo em middleware/__mocks__/authMiddleware.js
jest.mock('../../middleware/authMiddleware');

// Variáveis de teste global (DRY)
// REMOVIDA: const patientData = global.testPatientData; // Não utilizada no corpo dos testes
const authToken = global.testAuthToken; // Usamos o token definido no test_setup.js

// Novo conjunto de dados para não colidir com o paciente global (melhoria de DRY e isolamento)
const newPatientData = {
    name: "Maria Teste Sousa",
    cpf: "111.111.111-11", // CPF válido diferente
    dateOfBirth: "1995-05-05",
    email: "maria.teste@exemplo.com",
    phone: "11988776655",
    allergies: "Pólen"
};


describe('Patient API Endpoints', () => {
    // Garante que a tabela de Pacientes esteja vazia antes do conjunto de testes
    beforeAll(async () => {
        // Mantenho a estratégia original de limpar a tabela antes de tudo
        // O paciente global será recriado no `test_setup` (beforeAll global).
        await Patient.destroy({ where: {}, truncate: true, cascade: true });
    });

    // Garante que a tabela esteja vazia após cada teste para isolamento
    afterEach(async () => {
        // Vamos garantir que a tabela esteja vazia após CADA teste.
        await Patient.destroy({ where: {}, truncate: true, cascade: true });
    });

    // Teste de Criação (POST /api/patients)
    test('Deve criar um novo paciente com sucesso (com autenticação MOCK)', async () => {
        const response = await request(app)
            .post('/api/patients')
            // Usando o token global (DRY)
            .set('Authorization', `Bearer ${authToken}`)
            .send(newPatientData); // Usando novo paciente para o teste

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(newPatientData.name);
        expect(response.body.cpf).toBe(newPatientData.cpf);
    });

    // Teste de Criação (Validação de CPF duplicado)
    test('Não deve criar um paciente com CPF duplicado', async () => {
        // 1. Cria o primeiro paciente
        await Patient.create(newPatientData); // Usando newPatientData

        // 2. Tenta criar o segundo com o mesmo CPF
        const response = await request(app)
            .post('/api/patients')
            // Rota protegida deve ter o token:
            .set('Authorization', `Bearer ${authToken}`)
            .send(newPatientData); // Tenta criar novamente

        expect(response.statusCode).toBe(400); // 400 Bad Request
        // Observação: Sua controller/service deve lançar um erro com essa mensagem ou similar
        expect(response.body.error).toBe('O **CPF** fornecido já está registrado para outro paciente.');
    });

    // Teste de Leitura (GET /api/patients/:id)
    test('Deve retornar um paciente por ID', async () => {
        // 1. Cria um paciente para buscar
        const patientToFind = await Patient.create(newPatientData);

        // 2. Busca o paciente
        const response = await request(app)
            .get(`/api/patients/${patientToFind.id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(patientToFind.id);
        expect(response.body.name).toBe(patientToFind.name);
    });

    // Teste de Atualização (PUT /api/patients/:id)
    test('Deve atualizar um paciente com sucesso', async () => {
        // 1. Cria um paciente
        const patientToUpdate = await Patient.create(newPatientData);
        const updateData = { phone: "99999999999" };

        // 2. Atualiza o paciente
        const response = await request(app)
            .put(`/api/patients/${patientToUpdate.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Paciente atualizado com sucesso!');
        expect(response.body.patient.phone).toBe(updateData.phone);
    });

    // Teste de Exclusão (DELETE /api/patients/:id)
    test('Deve deletar um paciente com sucesso', async () => {
        // 1. Cria um paciente
        const patientToDelete = await Patient.create(newPatientData);

        // 2. Deleta o paciente
        const deleteResponse = await request(app)
            .delete(`/api/patients/${patientToDelete.id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(deleteResponse.statusCode).toBe(200);
        expect(deleteResponse.body.message).toBe('Paciente excluído com sucesso!');

        // 3. Verifica se foi realmente excluído
        const check = await Patient.findByPk(patientToDelete.id);
        expect(check).toBeNull();
    });
});