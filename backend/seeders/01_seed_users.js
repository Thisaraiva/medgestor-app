'use strict';
const bcryptjs = require('bcryptjs');
// Definir UUIDs fixos (Centralizados)
const ADMIN_USER_ID = '00000000-0000-4000-8000-000000000001';
const DOCTOR_USER_ID = '00000000-0000-4000-8000-000000000002'; // ID do Doutor padrão do Seed
const SECRETARY_USER_ID = '00000000-0000-4000-8000-000000000003'; 

//const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

// Exportamos os IDs para serem usados no test_setup.js e outras seeds (DRY)
module.exports = {
  ADMIN_USER_ID,
  DOCTOR_USER_ID,
  SECRETARY_USER_ID,

  async up(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
    
    // Obter senha do ambiente ou usar padrão
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'pass123';
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(defaultPassword, salt);

    await queryInterface.bulkInsert('users', [
      {
        id: ADMIN_USER_ID,
        name: 'Admin',
        email: 'admin@medgestor.com',
        password: hashedPassword,
        role: 'admin',
        crm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: DOCTOR_USER_ID,
        name: 'Dr. John Smith',
        email: 'doctor@medgestor.com',
        password: hashedPassword,
        role: 'doctor',
        crm: `CRM/SP-${faker.string.numeric(6)}`, 
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: SECRETARY_USER_ID,
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