'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const moment = require('moment'); // Importa Moment.js

module.exports = {
  async up(queryInterface) {
    const doctors = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'doctor@medgestor.com'");
    const patients = await queryInterface.sequelize.query("SELECT id FROM patients WHERE email = 'patient@medgestor.com'");

    if (!doctors[0].length || !patients[0].length) {
      throw new Error('Doctors or patients not found for seeding appointments');
    }

    const appointments = [
      {
        id: uuidv4(),
        doctorId: doctors[0][0].id,
        patientId: patients[0][0].id,
        date: '2025-07-01T10:00:00Z', // Data fixa para testes (ISO 8601 UTC)
        type: 'initial',
        insurance: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ...Array.from({ length: 2 }, () => {
        const futureDate = faker.date.future();
        // Converte a data gerada pelo faker (que é um objeto Date) para Moment,
        // e depois para ISO 8601 UTC string.
        return {
          id: uuidv4(),
          doctorId: faker.helpers.arrayElement(doctors[0]).id,
          patientId: faker.helpers.arrayElement(patients[0]).id,
          date: moment(futureDate).toISOString(), // Usando moment().toISOString()
          type: faker.helpers.arrayElement(['initial', 'return']),
          insurance: faker.datatype.boolean(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
    ];

    await queryInterface.bulkInsert('appointments', appointments, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('appointments', null, {});
  },
};
