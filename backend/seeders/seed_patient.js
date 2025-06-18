'use strict';
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkDelete('patients', null, {});

    const patients = Array.from({ length: 5 }, () => {
      const rawCpf = faker.string.numeric(11);
      const formattedCpf = `${rawCpf.substring(0, 3)}.${rawCpf.substring(3, 6)}.${rawCpf.substring(6, 9)}-${rawCpf.substring(9, 11)}`;
      return {
        id: uuidv4(),
        name: faker.person.fullName(),
        cpf: formattedCpf, // CPF formatado corretamente
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