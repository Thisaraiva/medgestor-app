'use strict';
   const { v4: uuidv4 } = require('uuid');
   const { faker } = require('@faker-js/faker');

   module.exports = {
     async up(queryInterface) {
       await queryInterface.bulkDelete('prescriptions', null, {});

       const doctors = await queryInterface.sequelize.query('SELECT id FROM users WHERE role = \'doctor\'');
       const patients = await queryInterface.sequelize.query('SELECT id FROM patients');

       const prescriptions = Array.from({ length: 3 }, () => ({
         id: uuidv4(),
         patientId: faker.helpers.arrayElement(patients[0]).id,
         doctorId: faker.helpers.arrayElement(doctors[0]).id,
         medication: faker.lorem.words(2),
         dosage: '500 mg',
         frequency: 'A cada 8 horas',
         duration: 'Por 5 dias',
         administrationInstructions: 'Tomar após refeições',
         notes: null,
         dateIssued: faker.date.past(),
         status: 'active',
         createdAt: new Date(),
         updatedAt: new Date(),
       }));

       await queryInterface.bulkInsert('prescriptions', prescriptions, {});
     },

     async down(queryInterface) {
       await queryInterface.bulkDelete('prescriptions', null, {});
     },
   };