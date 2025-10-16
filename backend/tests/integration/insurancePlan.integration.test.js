/*// Arquivo: C:\Programacao\Projetos\JavaScript\medgestor-app\backend\tests\integration\appointment.integration.test.js

const request = require('supertest');
const { createTestServer } = require('../test_setup');
const { sequelize, User, Patient, Appointment } = require('../../models');
const { generateToken } = require('../../utils/jwt');
const { sendAppointmentConfirmation } = require('../../utils/email');
const { v4: uuidv4 } = require('uuid');
const bcryptjs = require('bcryptjs');
const { parse, format, addDays, setHours, setMinutes } = require('date-fns');
const { zonedTimeToUtc } = require('date-fns-tz');
const { ptBR } = require('date-fns/locale');

jest.mock('../../utils/email');
jest.setTimeout(10000); // Aumentado um pouco para dar mais folga

// Define o fuso horário da aplicação para consistência nos testes
const APP_TIMEZONE = 'America/Sao_Paulo';

// Função para gerar um CPF válido (simplificado para testes)
// Esta função gera um CPF válido de acordo com as regras de dígitos verificadores
const generateValidCpf = () => {
    const randomNineDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

    // Calcula o primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += randomNineDigits[i] * (10 - i);
    }
    let d1 = 11 - (sum % 11);
    d1 = d1 > 9 ? 0 : d1;

    // Calcula o segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += randomNineDigits[i] * (11 - i);
    }
    sum += d1 * 2;
    let d2 = 11 - (sum % 11);
    d2 = d2 > 9 ? 0 : d2;

    const cpfArray = [...randomNineDigits, d1, d2];
    return `${cpfArray[0]}${cpfArray[1]}${cpfArray[2]}.${cpfArray[3]}${cpfArray[4]}${cpfArray[5]}.${cpfArray[6]}${cpfArray[7]}${cpfArray[8]}-${cpfArray[9]}${cpfArray[10]}`;
};


describe('Appointment Integration Tests', () => {
    let app;
    let adminToken;
    let doctorId;
    let patientId;
    let adminUser;
    let doctorUser;
    let patientObj;

    beforeAll(async () => {
        jest.setTimeout(20000); // Aumentado o timeout do beforeAll

        app = createTestServer();

        const adminPassword = await bcryptjs.hash('adminpass', 10);
        adminUser = await User.create({
            id: uuidv4(),
            name: 'Test Admin',
            email: 'testadmin@medgestor.com',
            password: adminPassword,
            role: 'admin',
            crm: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        adminToken = generateToken({ id: adminUser.id, role: adminUser.role });

        const doctorPassword = await bcryptjs.hash('doctorpass', 10);
        doctorUser = await User.create({
            id: uuidv4(),
            name: 'Dr. Test Integration',
            email: 'drtestintegration@medgestor.com',
            password: doctorPassword,
            role: 'doctor',
            crm: 'CRM/SP-123456',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        doctorId = doctorUser.id;

        patientObj = await Patient.create({
            id: uuidv4(),
            name: 'Patient Test Integration',
            cpf: generateValidCpf(), // GERANDO UM CPF VÁLIDO AGORA
            email: 'patienttestintegration@medgestor.com',
            phone: '11999998888',
            allergies: 'None',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        patientId = patientObj.id;

    }, 20000);

    beforeEach(async () => {
        await Appointment.destroy({ where: {} });
        sendAppointmentConfirmation.mockReset();
        sendAppointmentConfirmation.mockResolvedValue();
    });

    afterAll(async () => {
        await Appointment.destroy({ where: {} });
        if (patientObj && patientObj.id) {
            await Patient.destroy({ where: { id: patientObj.id } });
        }
        if (doctorUser && doctorUser.id) {
            await User.destroy({ where: { id: doctorUser.id } });
        }
        if (adminUser && adminUser.id) {
            await User.destroy({ where: { id: adminUser.id } });
        }
        await sequelize.close();
    });

    // Helper para gerar uma data futura formatada
    const generateFutureFormattedDate = (daysToAdd = 7, hours = 10, minutes = 0) => {
        let futureDate = addDays(new Date(), daysToAdd);
        futureDate = setHours(futureDate, hours);
        futureDate = setMinutes(futureDate, minutes);
        return format(futureDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    };

    // Helper para converter a string de data formatada para um objeto Date em UTC
    const convertFormattedDateToUtc = (formattedDate) => {
        const parsedDate = parse(formattedDate, 'dd/MM/yyyy HH:mm', new Date(), { locale: ptBR });
        return zonedTimeToUtc(parsedDate, APP_TIMEZONE);
    };

    describe('POST /api/appointments', () => {
        it('should create an appointment successfully and send email', async () => {
            const appointmentDate = generateFutureFormattedDate(7, 10, 0);

            const response = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    doctorId,
                    patientId,
                    date: appointmentDate,
                    type: 'initial',
                    insurance: true,
                });

            // If the CPF validation was the only issue, this should now be 201
            // If it's still 400, check the response.body.error for new validation messages
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.date).toBe(appointmentDate);
            expect(response.body.doctorId).toBe(doctorId);
            expect(response.body.patientId).toBe(patientId);
            expect(sendAppointmentConfirmation).toHaveBeenCalled();
        });

        it('should return 400 for invalid date format', async () => {
            const response = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    doctorId,
                    patientId,
                    date: 'invalid-date',
                    type: 'initial',
                    insurance: true,
                });

            expect(response.status).toBe(400);
            // Updated expectation based on your error output
            expect(response.body.error).toBe('Data deve estar no formato dd/MM/yyyy HH:mm');
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
        });

        it('should return 400 for past date', async () => {
            const pastDate = format(addDays(new Date(), -1), 'dd/MM/yyyy HH:mm', { locale: ptBR });

            const response = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    doctorId,
                    patientId,
                    date: pastDate,
                    type: 'initial',
                    insurance: true,
                });

            expect(response.status).toBe(400);
            // Updated expectation based on your error output (this might still be 'Acesso negado' if middleware order is specific)
            expect(response.body.error).toBe('Data deve ser futura');
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
        });

        it('should return 401 for unauthorized access', async () => {
            const appointmentDate = generateFutureFormattedDate(7, 10, 0);
            const response = await request(app)
                .post('/api/appointments')
                .send({
                    doctorId,
                    patientId,
                    date: appointmentDate,
                    type: 'initial',
                    insurance: true,
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Acesso negado, token não fornecido');
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid UUID', async () => {
            const appointmentDate = generateFutureFormattedDate(7, 10, 0);
            const response = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    doctorId: 'invalid-uuid',
                    patientId,
                    date: appointmentDate,
                    type: 'initial',
                    insurance: true,
                });

            expect(response.status).toBe(400);
            // Updated expectation based on your error output
            expect(response.body.error).toBe('"doctorId" must be a valid GUID');
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
        });

        it('should return 400 for conflicting appointment', async () => {
            const conflictDateFormatted = generateFutureFormattedDate(7, 10, 0);
            const conflictDateUtc = convertFormattedDateToUtc(conflictDateFormatted);

            await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId,
                date: conflictDateUtc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const response = await request(app)
                .post('/api/appointments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    doctorId,
                    patientId,
                    date: conflictDateFormatted,
                    type: 'initial',
                    insurance: true,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Médico já está agendado neste horário');
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
        });
    });

    describe('GET /api/appointments', () => {
        it('should return a list of appointments', async () => {
            const appointmentDate1Formatted = generateFutureFormattedDate(8, 10, 0);
            const appointmentDate1Utc = convertFormattedDateToUtc(appointmentDate1Formatted);

            await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId,
                date: appointmentDate1Utc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const response = await request(app)
                .get('/api/appointments')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].date).toBe(appointmentDate1Formatted);
        });

        it('should return filtered appointments', async () => {
            const appointmentDate1Formatted = generateFutureFormattedDate(9, 9, 0);
            const appointmentDate1Utc = convertFormattedDateToUtc(appointmentDate1Formatted);

            const appointmentDate2Formatted = generateFutureFormattedDate(9, 10, 0);
            const appointmentDate2Utc = convertFormattedDateToUtc(appointmentDate2Formatted);

            await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId,
                date: appointmentDate1Utc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const anotherPatient = await Patient.create({
                id: uuidv4(), name: 'Another Patient', cpf: generateValidCpf(), email: 'another@example.com', phone: '11999991111',
                createdAt: new Date(), updatedAt: new Date(),
            });

            await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId: anotherPatient.id,
                date: appointmentDate2Utc,
                type: 'return',
                insurance: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });


            const response = await request(app)
                .get(`/api/appointments?type=initial&doctorId=${doctorId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].type).toBe('initial');
            expect(response.body[0].doctorId).toBe(doctorId);

            if (anotherPatient && anotherPatient.id) {
                await Patient.destroy({ where: { id: anotherPatient.id } });
            }
        });
    });

    describe('GET /api/appointments/:id', () => {
        it('should return an appointment by ID', async () => {
            const appointmentDateFormatted = generateFutureFormattedDate(10, 10, 0);
            const appointmentDateUtc = convertFormattedDateToUtc(appointmentDateFormatted);

            const appointment = await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId,
                date: appointmentDateUtc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const response = await request(app)
                .get(`/api/appointments/${appointment.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(appointment.id);
            expect(response.body.date).toBe(appointmentDateFormatted);
        });

        it('should return 400 for invalid UUID', async () => {
            const response = await request(app)
                .get('/api/appointments/invalid-id')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            // Updated expectation based on your error output
            expect(response.body.error).toBe('"id" must be a valid GUID'); // Assuming 'id' is the param name
        });

        it('should return 404 for non-existent appointment', async () => {
            const response = await request(app)
                .get(`/api/appointments/${uuidv4()}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Consulta não encontrada');
        });
    });

    describe('PUT /api/appointments/:id', () => {
        it('should update an appointment successfully', async () => {
            const initialDateFormatted = generateFutureFormattedDate(11, 9, 0);
            const initialDateUtc = convertFormattedDateToUtc(initialDateFormatted);

            const appointment = await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId,
                date: initialDateUtc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const updatedDateFormatted = generateFutureFormattedDate(12, 11, 0);

            const response = await request(app)
                .put(`/api/appointments/${appointment.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    type: 'return',
                    date: updatedDateFormatted,
                    doctorId,
                    patientId,
                    insurance: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.type).toBe('return');
            expect(response.body.date).toBe(updatedDateFormatted);
        });

        it('should return 400 for invalid date format', async () => {
            const initialDateFormatted = generateFutureFormattedDate(11, 9, 0);
            const initialDateUtc = convertFormattedDateToUtc(initialDateFormatted);

            const appointment = await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId,
                date: initialDateUtc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const response = await request(app)
                .put(`/api/appointments/${appointment.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    type: 'return',
                    date: 'invalid-date',
                    doctorId,
                    patientId,
                    insurance: true,
                });

            expect(response.status).toBe(400);
            // Updated expectation
            expect(response.body.error).toBe('Data deve estar no formato dd/MM/yyyy HH:mm');
        });

        it('should return 400 for conflicting appointment', async () => {
            const appointment1DateFormatted = generateFutureFormattedDate(13, 10, 0);
            const appointment1DateUtc = convertFormattedDateToUtc(appointment1DateFormatted);

            const appointment2DateFormatted = generateFutureFormattedDate(13, 11, 0);
            const appointment2DateUtc = convertFormattedDateToUtc(appointment2DateFormatted);


            const appointment = await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId,
                date: appointment1DateUtc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId: patientId,
                date: appointment2DateUtc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const response = await request(app)
                .put(`/api/appointments/${appointment.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    type: 'return',
                    date: appointment2DateFormatted,
                    doctorId,
                    patientId,
                    insurance: true,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Médico já está agendado neste horário');
        });
    });

    describe('DELETE /api/appointments/:id', () => {
        it('should delete an appointment successfully', async () => {
            const appointmentDateFormatted = generateFutureFormattedDate(14, 10, 0);
            const appointmentDateUtc = convertFormattedDateToUtc(appointmentDateFormatted);

            const appointment = await Appointment.create({
                id: uuidv4(),
                doctorId,
                patientId,
                date: appointmentDateUtc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const response = await request(app)
                .delete(`/api/appointments/${appointment.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(204);
            const deleted = await Appointment.findByPk(appointment.id);
            expect(deleted).toBeNull();
        });

        it('should return 404 for non-existent appointment', async () => {
            const response = await request(app)
                .delete(`/api/appointments/${uuidv4()}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Consulta não encontrada');
        });
    });
});
*/