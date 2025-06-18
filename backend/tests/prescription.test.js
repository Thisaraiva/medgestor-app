const request = require('supertest');
const { createTestServer } = require('./test_setup');
const { /*sequelize, Prescription,*/ User, Patient } = require('../models');
const { generateToken } = require('../utils/jwt');

describe('Prescription API', () => {
    let app;
    let doctorToken;
    let patient;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        app = createTestServer();
        const doctor = await User.findOne({ where: { role: 'doctor' } });
        patient = await Patient.findOne();
        doctorToken = generateToken({ id: doctor.id, role: 'doctor' });
    });

    it('should create a new prescription', async () => {
        const res = await request(app)
            .post('/api/prescriptions')
            .set('Authorization', `Bearer ${doctorToken}`)
            .send({
                patientId: patient.id,
                medication: 'Ibuprofen',
                dosage: '500 mg',
                frequency: 'A cada 8 horas',
                duration: 'Por 5 dias',
                dateIssued: '2025-06-17',
            })
            .expect(201);

        expect(res.body.medication).toBe('Ibuprofen');
    });

    it('should get prescriptions by patient', async () => {
        const res = await request(app)
            .get(`/api/prescriptions/${patient.id}`)
            .set('Authorization', `Bearer ${doctorToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
    });
});