const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// MedicalRecord Model
const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  diagnosis: {
    type: DataTypes.TEXT,
  },
  treatment: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});