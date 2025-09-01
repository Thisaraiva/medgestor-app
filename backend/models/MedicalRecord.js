// Arquivo: C:\Programacao\Projetos\JavaScript\medgestor-app\backend\models\MedicalRecord.js

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
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false, // Diagnóstico agora é obrigatório
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'medical_records',
});

// Define as associações do modelo
MedicalRecord.associate = (models) => {
  MedicalRecord.belongsTo(models.Patient, { foreignKey: 'patientId' });
  MedicalRecord.belongsTo(models.Appointment, { foreignKey: 'appointmentId' });
};

module.exports = MedicalRecord;