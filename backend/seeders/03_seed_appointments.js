'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkDelete('appointments', null, {});

        const doctors = await queryInterface.sequelize.query('SELECT id FROM users WHERE role = \'doctor\'');
        const patients = await queryInterface.sequelize.query('SELECT id FROM patients');

        const appointments = Array.from({ length: 3 }, () => ({
            id: uuidv4(),
            doctorId: faker.helpers.arrayElement(doctors[0]).id,
            patientId: faker.helpers.arrayElement(patients[0]).id,
            date: faker.date.future(),
            type: faker.helpers.arrayElement(['initial', 'return']),
            insurance: faker.datatype.boolean(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('appointments', appointments, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('appointments', null, {});
    },
};