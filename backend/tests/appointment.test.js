const request = require('supertest');
     const app = require('../server');
     const { sequelize, User, Patient, Appointment } = require('../models');

     describe('Appointment API', () => {
       let token;
       let doctorId;
       let patientId;

       beforeAll(async () => {
         await sequelize.sync({ force: true });
         const user = await User.create({
           name: 'Test Doctor',
           email: 'doctor@example.com',
           password: 'password123',
           role: 'doctor',
         });
         doctorId = user.id;

         const patient = await Patient.create({
           name: 'Test Patient',
           cpf: '123.456.789-00',
           email: 'patient@example.com',
         });
         patientId = patient.id;

         const res = await request(app)
           .post('/api/auth/login')
           .send({ email: 'doctor@example.com', password: 'password123' });
         token = res.body.token;
       });

       afterAll(async () => {
         await sequelize.close();
       });

       it('should create a new appointment', async () => {
         const res = await request(app)
           .post('/api/appointments')
           .set('Authorization', `Bearer ${token}`)
           .send({
             doctorId,
             patientId,
             date: '2025-06-20T10:00:00Z',
             type: 'initial',
             insurance: false,
           });
         expect(res.statusCode).toBe(201);
         expect(res.body.date).toBe('2025-06-20T10:00:00.000Z');
       });
     });