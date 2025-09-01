// Arquivo C:\Programacao\Projetos\JavaScript\medgestor-app\backend\seeders\04_seed_appointments.js
'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const moment = require('moment');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkDelete('appointments', null, {});

    const doctors = await queryInterface.sequelize.query("SELECT id FROM users WHERE role = 'doctor'");
    const patients = await queryInterface.sequelize.query("SELECT id FROM patients");
    const insurancePlans = await queryInterface.sequelize.query("SELECT id FROM insurance_plans WHERE \"isActive\" = TRUE");

    if (!doctors[0].length || !patients[0].length) {
      throw new Error('Médicos ou pacientes não encontrados para a semeadura de agendamentos');
    }

    const doctorIds = doctors[0].map(d => d.id);
    const patientIds = patients[0].map(p => p.id);
    const insurancePlanIds = insurancePlans[0].map(ip => ip.id);

    const appointments = [
      {
        id: uuidv4(),
        doctorId: faker.helpers.arrayElement(doctorIds),
        patientId: faker.helpers.arrayElement(patientIds),
        date: moment().add(1, 'day').set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).toISOString(),
        type: 'initial',
        insurance: true,
        insurancePlanId: faker.helpers.arrayElement(insurancePlanIds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        doctorId: faker.helpers.arrayElement(doctorIds),
        patientId: faker.helpers.arrayElement(patientIds),
        date: moment().add(2, 'days').set({ hour: 14, minute: 30, second: 0, millisecond: 0 }).toISOString(),
        type: 'return',
        insurance: false,
        insurancePlanId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ...Array.from({ length: 5 }, () => {
        const isInsurance = faker.datatype.boolean();
        const futureDate = faker.date.future();
        return {
          id: uuidv4(),
          doctorId: faker.helpers.arrayElement(doctorIds),
          patientId: faker.helpers.arrayElement(patientIds),
          date: moment(futureDate).toISOString(),
          type: faker.helpers.arrayElement(['initial', 'return']),
          insurance: isInsurance,
          insurancePlanId: isInsurance && insurancePlanIds.length > 0 ? faker.helpers.arrayElement(insurancePlanIds) : null,
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