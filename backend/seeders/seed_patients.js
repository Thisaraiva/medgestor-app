'use strict';
     const { v4: uuidv4 } = require('uuid');

     module.exports = {
       async up(queryInterface) {
         // Limpar tabela antes de inserir
         await queryInterface.bulkDelete('patients', null, {});
         
         await queryInterface.bulkInsert('patients', [
           {
             id: uuidv4(),
             name: 'Ana Costa',
             cpf: '123.456.789-00',
             email: 'ana.costa@email.com',
             phone: '(11) 98765-4321',
             allergies: 'Penicilina',
             createdAt: new Date(),
             updatedAt: new Date(),
           },
           {
             id: uuidv4(),
             name: 'Pedro Santos',
             cpf: '987.654.321-00',
             email: 'pedro.santos@email.com',
             phone: '(11) 97654-3210',
             allergies: null,
             createdAt: new Date(),
             updatedAt: new Date(),
           },
           {
             id: uuidv4(),
             name: 'Clara Mendes',
             cpf: '345.678.901-22',
             email: 'clara.mendes@email.com',
             phone: '(11) 96543-2109',
             allergies: 'Amendoim',
             createdAt: new Date(),
             updatedAt: new Date(),
           },
           {
             id: uuidv4(),
             name: 'Lucas Ferreira',
             cpf: '456.789.012-33',
             email: 'lucas.ferreira@email.com',
             phone: '(11) 95432-1098',
             allergies: null,
             createdAt: new Date(),
             updatedAt: new Date(),
           },
           {
             id: uuidv4(),
             name: 'Sofia Almeida',
             cpf: '567.890.123-44',
             email: 'sofia.almeida@email.com',
             phone: '(11) 94321-0987',
             allergies: 'Látex',
             createdAt: new Date(),
             updatedAt: new Date(),
           },
         ], {});
       },

       async down(queryInterface) {
         await queryInterface.bulkDelete('patients', null, {});
       },
     };