'use strict';

   module.exports = {
     up: async (queryInterface, Sequelize) => {
       await queryInterface.createTable('patients', {
         id: {
           type: Sequelize.UUID,
           defaultValue: Sequelize.UUIDV4,
           primaryKey: true,
         },
         name: {
           type: Sequelize.STRING,
           allowNull: false,
         },
         cpf: {
           type: Sequelize.STRING,
           allowNull: false,
           unique: true,
         },
         email: {
           type: Sequelize.STRING,
           allowNull: true,
           unique: true,
         },
         phone: {
           type: Sequelize.STRING,
           allowNull: true,
         },
         allergies: {
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
       await queryInterface.dropTable('patients');
     },
   };