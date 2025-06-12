'use strict';

   module.exports = {
     up: async (queryInterface, Sequelize) => {
       await queryInterface.createTable('medical_records', {
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
         diagnosis: {
           type: Sequelize.TEXT,
           allowNull: true,
         },
         treatment: {
           type: Sequelize.TEXT,
           allowNull: true,
         },
         notes: {
           type: Sequelize.TEXT,
           allowNull: true,
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
       await queryInterface.dropTable('medical_records');
     },
   };