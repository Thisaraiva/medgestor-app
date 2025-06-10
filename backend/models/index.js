const fs = require('fs');
     const path = require('path');
     const Sequelize = require('sequelize');
     const sequelize = require('../config/database');

     const models = {};

     // Carrega todos os modelos dinamicamente
     fs.readdirSync(__dirname)
       .filter(file => file !== 'index.js' && file.endsWith('.js'))
       .forEach(file => {
         const model = require(path.join(__dirname, file));
         models[model.name] = model;
       });

     // Define associações
     const { User, Patient, Appointment, MedicalRecord, Prescription } = models;

     // Associações corrigidas
     User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
     Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

     Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
     Appointment.belongsTo(Patient, { as: 'patient', foreignKey: 'patientId' });

     Patient.hasMany(MedicalRecord, { foreignKey: 'patientId' });
     MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });

     Patient.hasMany(Prescription, { foreignKey: 'patientId' });
     Prescription.belongsTo(Patient, { foreignKey: 'patientId' });
     Prescription.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

     // Sincroniza modelos com o banco
     Object.values(models).forEach(model => {
       if (model.associate) {
         model.associate(models);
       }
     });

     module.exports = {
       sequelize,
       Sequelize,
       ...models,
     };