const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('initial', 'return'),
    allowNull: false,
  },
  insurance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'appointments',
});

// Adicionar a função associate
Appointment.associate = (models) => {
  Appointment.belongsTo(models.User, { as: 'doctor', foreignKey: 'doctorId' });
  Appointment.belongsTo(models.Patient, { as: 'patient', foreignKey: 'patientId' });
};

module.exports = Appointment;