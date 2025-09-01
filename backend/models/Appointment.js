// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\models\Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definição do modelo Appointment
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
  insurancePlanId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'insurance_plans',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
}, {
  timestamps: true,
  tableName: 'appointments',
});

// Adicionar a função associate para as associações
Appointment.associate = (models) => {
  Appointment.belongsTo(models.User, { as: 'doctor', foreignKey: 'doctorId' });
  Appointment.belongsTo(models.Patient, { as: 'patient', foreignKey: 'patientId' });
  Appointment.belongsTo(models.InsurancePlan, { as: 'insurancePlan', foreignKey: 'insurancePlanId' });
};

module.exports = Appointment;