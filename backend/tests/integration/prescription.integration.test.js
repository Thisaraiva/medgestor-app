const request = require('supertest');
const app = require('../../server');
const { Prescription } = require('../../models');

// **MOCK DO AUTH MIDDLEWARE:**
// Isso instrui o Jest a usar o arquivo em middleware/__mocks__/authMiddleware.js
jest.mock('../../middleware/authMiddleware');

// Variáveis GLOBAIS (Definidas em test_setup.js - DRY)
const testPatientId = global.testPatientId;
const testDoctorId = global.testAuthUser.id;
const authToken = global.testAuthToken;

// Dados de teste corrigidos para refletir o schema do model e os requisitos de validação.
const testPrescriptionData = {
    patientId: testPatientId,
    // doctorId NÃO é enviado no POST, será injetado pelo controller/middleware
    medication: 'Amoxicilina 500mg',
    dosage: '1 cápsula a cada 8 horas',
    frequency: '3 vezes ao dia',
    duration: '7 dias',
    administrationInstructions: 'Tomar por 7 dias, após as refeições.',
    notes: 'Alergia a Sulfa. Verificar histórico.',
    dateIssued: new Date().toISOString().split('T')[0], // Data obrigatória no formato YYYY-MM-DD
    status: 'active',
};

describe('Prescription API Endpoints', () => {
    let createdPrescription; // Para armazenar a prescrição criada para os testes subsequentes

    // Garante que o mock do authMiddleware retorne o doctorId correto
    beforeAll(() => {
        // Apenas uma verificação de segurança, a criação do usuário está no setup global.
        if (!global.testAuthUser || !global.testAuthToken) {
            throw new Error('ERRO DE SETUP: Variáveis globais de autenticação não definidas. Execute o test_setup.js corretamente.');
        }
    });

    // Função auxiliar (DRY) para criar uma prescrição diretamente no DB
    const setupPrescription = async (data = testPrescriptionData) => {
        if (!createdPrescription) {
            // Cria a prescrição diretamente no banco, injetando doctorId, patientId e outros defaults necessários
            createdPrescription = await Prescription.create({
                ...data,
                doctorId: testDoctorId,
                patientId: testPatientId,
            });
        }
        return createdPrescription.id;
    };

    // Limpar a tabela de Prescrições antes de cada teste
    beforeEach(async () => {
        // Limpa apenas a tabela de Prescrições, não Users e Patients, pois são dependências
        await Prescription.destroy({ where: {}, truncate: true, cascade: true });
        createdPrescription = null; // Reseta a variável para forçar a recriação no próximo setup
    });

    // 1. POST /api/prescriptions
    describe('POST /api/prescriptions', () => {
        test('Deve criar uma nova prescrição com sucesso', async () => {
            const response = await request(app)
                .post('/api/prescriptions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testPrescriptionData);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.medication).toBe(testPrescriptionData.medication);
            // Verifica se o ID do médico logado foi injetado corretamente pelo controller
            expect(response.body.doctorId).toBe(testDoctorId);
            expect(response.body.patientId).toBe(testPatientId);

            createdPrescription = response.body; // Armazena para uso posterior
        });

        test('Não deve criar prescrição sem autenticação (401)', async () => {

            // 1. DESFAZ O MOCK GLOBAL DO authMiddleware
            // Isso permite que o código use o authMiddleware REAL para este teste
            //const authMiddlewareModule = jest.requireActual('../../middleware/authMiddleware');

            // 2. Temporariamente substitui o authMiddleware na rota para o teste
            // ATENÇÃO: Essa abordagem funciona se você tiver como mockar a rota,
            // mas é mais simples alterar o mock para ser condicional,
            // ou desabilitar o mock apenas para este teste.
            // Para sua arquitetura com jest.mock global no topo, o UNMOCK temporário é mais limpo.

            // Infelizmente, desfazer o mock global sem re-require da aplicação é complexo.
            // A solução mais robusta é modificar o mock para ser condicional.

            // --- NOVA ABORDAGEM: Modificando o mock para que ele falhe se o header não estiver presente ---
            // Vamos mudar o mock para que ele verifique se o token foi passado no header.
            // Se o token for passado, ele injeta o usuário, se não, ele simula a falha 401.

            // **VOLTANDO AO CÓDIGO DO TESTE SEM ALTERAÇÃO:**
            const response = await request(app)
                .post('/api/prescriptions')
                .send(testPrescriptionData); // Sem header de Authorization

            expect(response.statusCode).toBe(401);
            expect(response.body.error).toBe('Acesso negado, token não fornecido');
        });

        test('Não deve criar prescrição com dados inválidos (400 - medication muito curto)', async () => {
            const invalidData = { ...testPrescriptionData, medication: 'A' }; // Medicamento muito curto
            const response = await request(app)
                .post('/api/prescriptions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toContain('"medication" length must be at least 3 characters long');
        });
    });

    // 2. GET /api/prescriptions/patient/:patientId
    describe('GET /api/prescriptions/patient/:patientId', () => {
        test('Deve retornar todas as prescrições de um paciente', async () => {
            const prescriptionId = await setupPrescription();

            const response = await request(app)
                .get(`/api/prescriptions/patient/${testPatientId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0].id).toBe(prescriptionId);
        });

        test('Deve retornar 400 se o patientId for inválido', async () => {
            const response = await request(app)
                .get('/api/prescriptions/patient/123-invalid-id')
                .set('Authorization', `Bearer ${authToken}`);

            // A rota usa express-validator, que retorna um array de errors
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toEqual(
                expect.arrayContaining(['ID do paciente inválido'])
            );
        });
    });

    // 3. GET /api/prescriptions/:id
    describe('GET /api/prescriptions/:id', () => {
        test('Deve retornar uma prescrição por ID com sucesso', async () => {
            const prescriptionId = await setupPrescription();

            const response = await request(app)
                .get(`/api/prescriptions/${prescriptionId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBe(prescriptionId);
            expect(response.body.medication).toBe(testPrescriptionData.medication);
        });

        test('Deve retornar 404 se a prescrição não for encontrada', async () => {
            const nonExistentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
            const response = await request(app)
                .get(`/api/prescriptions/${nonExistentId}`)
                .set('Authorization', `Bearer ${global.testAuthToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Prescrição não encontrada');
        });
    });

    // 4. PUT /api/prescriptions/:id
    describe('PUT /api/prescriptions/:id', () => {
        test('Deve atualizar uma prescrição com sucesso', async () => {
            const prescriptionId = await setupPrescription();
            const updateData = {
                medication: 'Amoxicilina 875mg',
                dosage: '2 cápsulas por dia',
            };

            const response = await request(app)
                .put(`/api/prescriptions/${prescriptionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Prescrição atualizada com sucesso!');
            expect(response.body.prescription.medication).toBe(updateData.medication);
            expect(response.body.prescription.dosage).toBe(updateData.dosage);
        });

        test('Deve retornar 400 se o corpo da atualização estiver vazio', async () => {
            const prescriptionId = await setupPrescription();

            const response = await request(app)
                .put(`/api/prescriptions/${prescriptionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.statusCode).toBe(400);
            // O erro de Joi no Controller é 'Pelo menos um campo deve ser fornecido para atualização.'
            expect(response.body.error).toBe('Pelo menos um campo deve ser fornecido para atualização.');
        });
    });

    // 5. DELETE /api/prescriptions/:id
    describe('DELETE /api/prescriptions/:id', () => {
        test('Deve excluir uma prescrição com sucesso', async () => {
            const prescriptionId = await setupPrescription();

            const response = await request(app)
                .delete(`/api/prescriptions/${prescriptionId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Prescrição excluída com sucesso!');

            const deletedPrescription = await Prescription.findByPk(prescriptionId);
            expect(deletedPrescription).toBeNull();
        });
    });
});