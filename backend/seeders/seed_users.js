'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    // Limpar tabela antes de inserir
    await queryInterface.bulkDelete('users', null, {});
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.SEED_DEFAULT_PASSWORD || 'pass123', salt);

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
        name: 'Dr. João Silva',
        email: 'joao.silva@medgestor.com',
        password: hashedPassword,
        role: 'doctor',
        crm: 'CRM/SP-123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Maria Oliveira',
        email: 'maria.oliveira@medgestor.com',
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