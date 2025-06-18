const request = require('supertest');
    const { createTestServer } = require('./test_setup');
    const { /*sequelize, MedicalRecord,*/ User, Patient } = require('../models');
    const { generateToken } = require('../utils/jwt');

    describe('Medical Record API', () => {
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

      it('should create a new medical record', async () => {
        const res = await request(app)
          .post('/api/records')
          .set('Authorization', `Bearer ${doctorToken}`)
          .send({
            patientId: patient.id,
            diagnosis: 'Gripe',
            treatment: 'Repouso e hidratação',
            notes: 'Monitorar febre',
          })
          .expect(201);

        expect(res.body.diagnosis).toBe('Gripe');
      });

      it('should get records by patient', async () => {
        const res = await request(app)
          .get(`/api/records/${patient.id}`)
          .set('Authorization', `Bearer ${doctorToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });