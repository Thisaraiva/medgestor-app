const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Patient Model
const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
  },
  allergies: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});