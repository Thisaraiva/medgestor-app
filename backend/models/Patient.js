const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    validate: {
      isCPFValid(value) {
        // Remover pontos e traço antes de validar o formato numérico e o tamanho
        const cleanedCPF = value.replace(/[.-]/g, '');
        if (!/^\d{11}$/.test(cleanedCPF)) {
          throw new Error('CPF deve conter 11 dígitos numéricos.');
        }
        // Opcional: Adicionar uma validação de CPF mais robusta aqui se desejar (ex: algoritmo de validação de CPF)
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'patients',
});

// Adicionar a função associate
Patient.associate = (models) => {
  Patient.hasMany(models.Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
  Patient.hasMany(models.MedicalRecord, { foreignKey: 'patientId' });
  Patient.hasMany(models.Prescription, { foreignKey: 'patientId' });
};

module.exports = Patient;