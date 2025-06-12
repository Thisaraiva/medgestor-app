const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'doctor', 'secretary'),
    allowNull: false,
  },
  crm: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'CRM do médico (opcional)',
  },
}, {
  timestamps: true,
  tableName: 'users',
});

module.exports = User;