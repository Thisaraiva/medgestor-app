'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prescriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      doctorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      medication: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dosage: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Ex.: 500 mg',
      },
      frequency: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Ex.: A cada 8 horas às 8h, 16h, 24h',
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Ex.: Por 5 dias',
      },
      administrationInstructions: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ex.: Tomar após as refeições com água',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ex.: Evitar álcool durante o tratamento',
      },
      dateIssued: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'expired'),
        defaultValue: 'active',
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
    await queryInterface.dropTable('prescriptions');
  },
};