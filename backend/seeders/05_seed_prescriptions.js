'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');
// Importa os IDs fixos definidos nas seeds de Users e Patients
const { DOCTOR_USER_ID } = require('./01_seed_users'); 
const { JANE_DOE_PATIENT_ID } = require('./02_seed_patient');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkDelete('prescriptions', null, {});

    // IDs fixos importados
    const doctorIdFixo = DOCTOR_USER_ID;
    const patientIdFixo = JANE_DOE_PATIENT_ID;
    
    // Podemos buscar outros pacientes e doutores para as seeds aleatórias
    const allDoctors = await queryInterface.sequelize.query("SELECT id FROM users WHERE role = 'doctor'");
    const allPatients = await queryInterface.sequelize.query("SELECT id FROM patients");
    
    const allDoctorIds = allDoctors[0].map(d => d.id);
    const allPatientIds = allPatients[0].map(p => p.id);

    const prescriptions = [
      {
        id: uuidv4(),
        patientId: patientIdFixo, // Usa o ID Fixo do Seed
        doctorId: doctorIdFixo, // Usa o ID Fixo do Seed
        medication: 'Paracetamol',
        dosage: '500 mg',
        frequency: 'A cada 8 horas',
        duration: 'Por 5 dias',
        administrationInstructions: 'Tomar após refeições',
        notes: null,
        dateIssued: new Date('2025-06-01'),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ...Array.from({ length: 4 }, () => ({
        id: uuidv4(),
        patientId: faker.helpers.arrayElement(allPatientIds),
        doctorId: faker.helpers.arrayElement(allDoctorIds),
        medication: faker.lorem.words(2),
        dosage: '500 mg',
        frequency: 'A cada 8 horas',
        duration: 'Por 5 dias',
        administrationInstructions: 'Tomar após refeições',
        notes: null,
        dateIssued: faker.date.recent(),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    ];

    await queryInterface.bulkInsert('prescriptions', prescriptions, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('prescriptions', null, {});
  },
};