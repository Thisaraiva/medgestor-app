const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InsurancePlan = sequelize.define('InsurancePlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: 'insurance_plans',
});

// Não há associações diretas aqui, mas outros modelos podem se associar a ele.

module.exports = InsurancePlan;
