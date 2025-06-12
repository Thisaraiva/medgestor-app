'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@medgestor.com',
        password: hashedPassword,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Dr. João Silva',
        email: 'joao.silva@medgestor.com',
        password: hashedPassword,
        role: 'doctor',
        crm: 'CRM12345',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Maria Oliveira',
        email: 'maria.oliveira@medgestor.com',
        password: hashedPassword,
        role: 'secretary',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    await queryInterface.bulkInsert('patients', [
      {
        id: uuidv4(),
        name: 'Ana Costa',
        cpf: '123.456.789-00',
        email: 'ana.costa@email.com',
        phone: '(11) 98765-4321',
        allergies: 'Penicilina',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Pedro Santos',
        cpf: '234.567.890-11',
        email: 'pedro.santos@email.com',
        phone: '(11) 97654-3210',
        allergies: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Clara Mendes',
        cpf: '345.678.901-22',
        email: 'clara.mendes@email.com',
        phone: '(11) 96543-2109',
        allergies: 'Amendoim',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Lucas Ferreira',
        cpf: '456.789.012-33',
        email: 'lucas.ferreira@email.com',
        phone: '(11) 95432-1098',
        allergies: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Sofia Almeida',
        cpf: '567.890.123-44',
        email: 'sofia.almeida@email.com',
        phone: '(11) 94321-0987',
        allergies: 'Látex',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('patients', null, {});
  },
};