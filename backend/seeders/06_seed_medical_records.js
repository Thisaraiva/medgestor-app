// Arquivo: C:\Programacao\Projetos\JavaScript\medgestor-app\backend\seeders\06_seed_medical_records.js

'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkDelete('medical_records', null, {});

    const [patients] = await queryInterface.sequelize.query('SELECT id FROM patients');
    const patientIds = patients.map(p => p.id);

    const records = Array.from({ length: 3 }, () => ({
      id: uuidv4(),
      patientId: faker.helpers.arrayElement(patientIds),
      diagnosis: faker.lorem.sentence(),
      treatment: faker.lorem.sentence(),
      notes: faker.lorem.sentence(),
      date: faker.date.recent().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('medical_records', records, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('medical_records', null, {});
  },
};