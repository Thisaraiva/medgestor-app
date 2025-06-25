'use strict';
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(process.env.SEED_DEFAULT_PASSWORD || 'pass123', salt);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'Admin',
        email: 'admin@medgestor.com',
        password: hashedPassword,
        role: 'admin',
        crm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Dr. John Smith',
        email: 'doctor@medgestor.com',
        password: hashedPassword,
        role: 'doctor',
        crm: `CRM/SP-${faker.string.numeric(6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: faker.person.fullName(),
        email: faker.internet.email({ provider: 'medgestor.com' }),
        password: hashedPassword,
        role: 'secretary',
        crm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};