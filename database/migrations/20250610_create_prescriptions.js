'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prescriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      doctor_id: {
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
        allowNull: false,
        comment: 'Ex.: 500 mg',
      },
      frequency: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ex.: A cada 8 horas às 8h, 16h, 24h',
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ex.: Por 5 dias',
      },
      administration_instructions: {
        type: Sequelize.TEXT,
        comment: 'Ex.: Tomar após as refeições com água',
      },
      notes: {
        type: Sequelize.TEXT,
        comment: 'Ex.: Evitar álcool durante o tratamento',
      },
      date_issued: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'expired'),
        defaultValue: 'active',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('prescriptions');
  },
};