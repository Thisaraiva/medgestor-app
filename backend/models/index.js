const sequelize = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Prescription = require('./Prescription');

// Define associations
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });

Patient.hasMany(MedicalRecord, { foreignKey: 'patientId' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });

Patient.hasMany(Prescription, { foreignKey: 'patientId' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId' });
Prescription.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

module.exports = {
  sequelize,
  User,
  Patient,
  Appointment,
  MedicalRecord,
  Prescription,
};