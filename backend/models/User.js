const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

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
    validate: {
      isEmail: true,
    },
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
    validate: {
      isCrmValid(value) {
        if (this.role === 'doctor' && !value) {
          throw new Error('CRM is required for doctors');
        }
        if (this.role !== 'doctor' && value) {
            throw new Error('CRM must be null for non-doctors');
        }
      },
    },
  },
}, {
  timestamps: true,
  tableName: 'users',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

// Adicionar a função associate
User.associate = (models) => {
  User.hasMany(models.Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
  User.hasMany(models.Prescription, { foreignKey: 'doctorId', as: 'doctorPrescriptions' });
};

module.exports = User;