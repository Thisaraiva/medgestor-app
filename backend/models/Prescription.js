const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Prescription Model
const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  medication: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateIssued: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
});