const request = require('supertest');
const app = require('../../server');
const { Prescription } = require('../../models');

// Assumindo que estes IDs são strings UUIDs válidos definidos em test_setup.js
const testPatientId = global.testPatientId || 'e1b40280-4963-44f0-82a8-f703e227d848';
const testDoctorId = global.testDoctorId || 'a4a77e50-25e2-4f91-8d26-b184f7b6d13d';

// Dados de teste corrigidos para refletir o schema do model e os requisitos de validação.
const testPrescriptionData = {
    patientId: testPatientId, // AGORA É UM UUID STRING VÁLIDO
    // doctorId NÃO é enviado no POST, será injetado pelo controller
    medication: 'Amoxicilina 500mg',
    dosage: '1 cápsula a cada 8 horas',
    administrationInstructions: 'Tomar por 7 dias, após as refeições.', // Nome do campo corrigido
    dateIssued: new Date().toISOString().split('T')[0], // Data obrigatória no formato YYYY-MM-DD
    status: 'active',
};

describe('Prescription API Endpoints', () => {
    let authToken; // Variável para armazenar o token de autenticação
    let createdPrescription; // Para armazenar a prescrição criada para os testes subsequentes

    beforeAll(() => {
        if (global.testAuthToken) {
            authToken = global.testAuthToken;
        } else {
            console.error('ERRO DE SETUP: global.testAuthToken não está definido. Certifique-se de que o usuário de teste está logado no setup.');
            // Usaremos um token de placeholder para garantir que o mock funcione, mas é crucial ter o token real no setup.
            authToken = 'MOCK_TOKEN_FOR_AUTH_MOCK';
        }

        // Garante que o mock do authMiddleware retorne o doctorId correto
        global.testAuthUser = { id: testDoctorId, role: 'doctor', name: 'Dr. Test' };
    });

    // Limpar a tabela de Prescrições antes de cada teste
    beforeEach(async () => {
        // Limpa a tabela para isolar os testes
        await Prescription.destroy({ where: {}, truncate: true, cascade: true });
        createdPrescription = null;
    });

    // POST /api/prescriptions
    describe('POST /api/prescriptions', () => {
        test('Deve criar uma nova prescrição com sucesso', async () => {
            const response = await request(app)
                .post('/api/prescriptions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testPrescriptionData);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.medication).toBe(testPrescriptionData.medication);
            expect(response.body.doctorId).toBe(testDoctorId); // Verifica se o ID do médico logado foi injetado

            createdPrescription = response.body; // Armazena para uso posterior
        });

        test('Não deve criar prescrição sem autenticação (401)', async () => {
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
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('"medication" length must be at least 3 characters long');
        });

        test('Não deve criar prescrição sem dateIssued (400)', async () => {
            const { ...dataWithoutDate } = testPrescriptionData;
            const response = await request(app)
                .post('/api/prescriptions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(dataWithoutDate);

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toContain('"dateIssued" is required');
        });
    });

    // Funções auxiliares para criar uma prescrição antes dos testes GET/PUT/DELETE
    const setupPrescription = async () => {
        if (!createdPrescription) {
            // Cria a prescrição diretamente no banco, pois o doctorId é obrigatório
            createdPrescription = await Prescription.create({
                ...testPrescriptionData,
                doctorId: testDoctorId, // Deve ser fornecido aqui
            });
        }
        return createdPrescription.id;
    };

    // GET /api/prescriptions/patient/:patientId
    describe('GET /api/prescriptions/patient/:patientId', () => {
        test('Deve retornar todas as prescrições de um paciente', async () => {
            const prescriptionId = await setupPrescription();

            const response = await request(app)
                .get(`/api/prescriptions/patient/${testPatientId}`) // Rota correta: busca por paciente
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0].id).toBe(prescriptionId);
            expect(response.body[0].medication).toBe(testPrescriptionData.medication);
        });

        test('Deve retornar 400 se o patientId for inválido', async () => {
            const response = await request(app)
                .get('/api/prescriptions/patient/123-invalid-id')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toContain('ID do paciente inválido');
        });
    });

    // GET /api/prescriptions/:id
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
            const nonExistentId = '99999999-0000-0000-0000-000000000000';
            const response = await request(app)
                .get(`/api/prescriptions/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Prescrição não encontrada');
        });
    });

    // PUT /api/prescriptions/:id
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

        test('Deve retornar 404 se tentar atualizar uma prescrição inexistente', async () => {
            const nonExistentId = '99999999-0000-0000-0000-000000000000';
            const updateData = { medication: 'Novo Medicamento' };

            const response = await request(app)
                .put(`/api/prescriptions/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Prescrição não encontrada');
        });

        test('Deve retornar 400 se o corpo da atualização estiver vazio', async () => {
            const prescriptionId = await setupPrescription();

            const response = await request(app)
                .put(`/api/prescriptions/${prescriptionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Pelo menos um campo deve ser fornecido para atualização.');
        });
    });

    // DELETE /api/prescriptions/:id
    describe('DELETE /api/prescriptions/:id', () => {
        test('Deve excluir uma prescrição com sucesso', async () => {
            const prescriptionId = await setupPrescription();

            const response = await request(app)
                .delete(`/api/prescriptions/${prescriptionId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Prescrição excluída com sucesso!');

            // Verifica se foi realmente excluída do banco de dados
            const deletedPrescription = await Prescription.findByPk(prescriptionId);
            expect(deletedPrescription).toBeNull();
        });

        test('Deve retornar 404 se tentar excluir uma prescrição inexistente', async () => {
            const nonExistentId = '99999999-0000-0000-0000-000000000000';

            const response = await request(app)
                .delete(`/api/prescriptions/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Prescrição não encontrada');
        });
    });
});
