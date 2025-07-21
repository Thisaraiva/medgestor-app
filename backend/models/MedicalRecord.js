const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id',
    },
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true, // Pode ser nulo se o prontuário for criado fora de um agendamento
    references: {
      model: 'appointments',
      key: 'id',
    },
    onDelete: 'SET NULL', // Se o agendamento for excluído, o prontuário permanece, mas o link é removido
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: { // Adicionado o campo 'date'
    type: DataTypes.DATE,
    allowNull: false, // Tornando-o obrigatório
    defaultValue: DataTypes.NOW, // Valor padrão para a data atual
  },
}, {
  timestamps: true,
  tableName: 'medical_records',
});

// Adicionar a função associate
MedicalRecord.associate = (models) => {
  MedicalRecord.belongsTo(models.Patient, { foreignKey: 'patientId' });
  MedicalRecord.belongsTo(models.Appointment, { foreignKey: 'appointmentId' }); // NOVA ASSOCIAÇÃO
};

module.exports = MedicalRecord;