'use strict';

module.exports = {
  up: async (queryInterface, _Sequelize) => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('pass123', 10);

    await queryInterface.bulkInsert('Users', [{
      name: 'Administrador',
      email: 'admin@medgestor.com',
      password: hash,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, _Sequelize) => {
    await queryInterface.bulkDelete('Users', { email: 'admin@medgestor.com' });
  }
};