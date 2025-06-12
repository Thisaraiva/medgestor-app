'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('appointments', 'created_at', 'createdAt');
    await queryInterface.renameColumn('appointments', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('medical_records', 'created_at', 'createdAt');
    await queryInterface.renameColumn('medical_records', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('patients', 'created_at', 'createdAt');
    await queryInterface.renameColumn('patients', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('prescriptions', 'created_at', 'createdAt');
    await queryInterface.renameColumn('prescriptions', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('users', 'created_at', 'createdAt');
    await queryInterface.renameColumn('users', 'updated_at', 'updatedAt');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('appointments', 'createdAt', 'created_at');
    await queryInterface.renameColumn('appointments', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('medical_records', 'createdAt', 'created_at');
    await queryInterface.renameColumn('medical_records', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('patients', 'createdAt', 'created_at');
    await queryInterface.renameColumn('patients', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('prescriptions', 'createdAt', 'created_at');
    await queryInterface.renameColumn('prescriptions', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('users', 'createdAt', 'created_at');
    await queryInterface.renameColumn('users', 'updatedAt', 'updated_at');
  },
};