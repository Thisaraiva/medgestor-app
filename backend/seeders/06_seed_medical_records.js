'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const moment = require('moment'); // Importa Moment.js

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkDelete('medical_records', null, {});

        const patients = await queryInterface.sequelize.query('SELECT id FROM patients');
        // Extrai apenas os IDs dos pacientes
        const patientIds = patients[0].map(p => p.id);

        const records = Array.from({ length: 3 }, () => ({
            id: uuidv4(),
            patientId: faker.helpers.arrayElement(patientIds), // Usar IDs válidos de pacientes
            diagnosis: faker.lorem.sentence(),
            treatment: faker.lorem.sentence(),
            notes: faker.lorem.sentence(),
            date: moment(faker.date.recent()).toISOString(), // Usando moment().toISOString()
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('medical_records', records, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('medical_records', null, {});
    },
};
