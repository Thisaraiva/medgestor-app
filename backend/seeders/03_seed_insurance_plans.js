'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const insurancePlans = [
      {
        id: uuidv4(),
        name: 'Unimed',
        description: 'Plano de saúde Unimed',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Bradesco Saúde',
        description: 'Plano de saúde Bradesco',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Amil',
        description: 'Plano de saúde Amil',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Hapvida',
        description: 'Plano de saúde Hapvida',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('insurance_plans', insurancePlans, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('insurance_plans', null, {});
  },
};
