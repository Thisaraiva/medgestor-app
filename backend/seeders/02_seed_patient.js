'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkDelete('patients', null, {});

    const patients = Array.from({ length: 5 }, () => {
      const cpfRaw = faker.string.numeric({ length: 11 });
      const cpfFormatted = `${cpfRaw.slice(0, 3)}.${cpfRaw.slice(3, 6)}.${cpfRaw.slice(6, 9)}-${cpfRaw.slice(9, 11)}`;
      return {
        id: uuidv4(),
        name: faker.person.fullName(),
        cpf: cpfFormatted,
        email: faker.internet.email(),
        phone: faker.phone.number('(##) #####-####'),
        allergies: faker.helpers.arrayElement(['Penicilina', 'Amendoim', 'Látex', null]),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    await queryInterface.bulkInsert('patients', patients, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('patients', null, {});
  },
};