const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
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
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  medication: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ex.: 500 mg',
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ex.: A cada 8 horas às 8h, 16h, 24h',
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ex.: Por 5 dias',
  },
  administrationInstructions: {
    type: DataTypes.TEXT,
    comment: 'Ex.: Tomar após as refeições com água',
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'Ex.: Evitar álcool durante o tratamento',
  },
  dateIssued: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'expired'),
    defaultValue: 'active',
  },
}, {
  timestamps: true,
  tableName: 'prescriptions',
});

module.exports = Prescription;