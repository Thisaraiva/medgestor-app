'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkDelete('medical_records', null, {});

        const patients = await queryInterface.sequelize.query('SELECT id FROM patients');

        const records = Array.from({ length: 3 }, () => ({
            id: uuidv4(),
            patientId: faker.helpers.arrayElement(patients[0]).id,
            diagnosis: faker.lorem.sentence(),
            treatment: faker.lorem.sentence(),
            notes: faker.lorem.sentence(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('medical_records', records, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('medical_records', null, {});
    },
};