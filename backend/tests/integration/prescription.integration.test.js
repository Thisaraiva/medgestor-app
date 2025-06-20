const request = require('supertest');
const { createTestServer } = require('../test_setup');
const { User, Patient, Prescription } = require('../../models');
const { generateToken } = require('../../utils/jwt');

describe('Prescription API', () => {
    let app;
    let doctorToken;
    let patient;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        app = createTestServer();
        const doctor = await User.findOne({ where: { role: 'doctor' } });
        patient = await Patient.findOne();
        if (!doctor || !patient) {
            throw new Error('Doctor or patient not found in seed data');
        }
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
                dateIssued: new Date('2025-06-17').toISOString(),
            })
            .expect(201);

        expect(res.body.medication).toBe('Ibuprofen');
    });

    it('should get prescriptions by patient', async () => {
        await Prescription.create({
            patientId: patient.id,
            doctorId: (await User.findOne({ where: { role: 'doctor' } })).id,
            medication: 'Ibuprofen',
            dosage: '500 mg',
            frequency: 'A cada 8 horas',
            duration: 'Por 5 dias',
            dateIssued: new Date('2025-06-17'),
            status: 'active',
        });
        const res = await request(app)
            .get(`/api/prescriptions/patient/${patient.id}`)
            .set('Authorization', `Bearer ${doctorToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });
});