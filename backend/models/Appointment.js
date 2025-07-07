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
  // NOVO: Campo para o ID do plano de saúde, opcional (pode ser nulo se não usar convênio)
  insurancePlanId: {
    type: DataTypes.UUID,
    allowNull: true, // Pode ser nulo se 'insurance' for false
    references: {
      model: 'insurance_plans', // Referencia a nova tabela de planos de saúde
      key: 'id',
    },
    onDelete: 'SET NULL', // Se um plano for excluído, o campo fica nulo, não exclui o agendamento
  },
}, {
  timestamps: true,
  tableName: 'appointments',
});

// Adicionar a função associate
Appointment.associate = (models) => {
  Appointment.belongsTo(models.User, { as: 'doctor', foreignKey: 'doctorId' });
  Appointment.belongsTo(models.Patient, { as: 'patient', foreignKey: 'patientId' });
  // NOVO: Associação com o modelo InsurancePlan
  Appointment.belongsTo(models.InsurancePlan, { as: 'insurancePlan', foreignKey: 'insurancePlanId' });
};

module.exports = Appointment;