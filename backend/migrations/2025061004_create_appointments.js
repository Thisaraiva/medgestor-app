'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cria a tabela 'appointments' já com a coluna 'insurancePlanId'
    // A tabela 'insurance_plans' é esperada que já exista (criada por 2025061003_create_insurance_plans.js)
    await queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      doctorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      patientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('initial', 'return'),
        allowNull: false,
      },
      insurance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      insurancePlanId: { // NEW: Column for the insurance plan ID
        type: Sequelize.UUID,
        allowNull: true, // Can be null if 'insurance' is false (private appointment)
        references: {
          model: 'insurance_plans', // References the insurance plans table
          key: 'id',
        },
        onDelete: 'SET NULL', // If an insurance plan is deleted, the field becomes null, it doesn't delete the appointment
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    // Drops the 'appointments' table
    await queryInterface.dropTable('appointments');
  },
};
