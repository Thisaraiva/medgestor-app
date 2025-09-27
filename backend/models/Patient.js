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
        // Aceitar formato com pontos e traço (e.g., 123.456.789-01) ou apenas números
        const cleanedCPF = value.replace(/[.-]/g, '');
        if (!/^\d{11}$/.test(cleanedCPF)) {
          throw new Error('CPF deve conter 11 dígitos numéricos.');
        }
        // Opcional: Adicionar validação de dígitos verificadores do CPF
        const digits = cleanedCPF.split('').map(Number);
        const calculateCheckDigit = (digits, start, length) => {
          let sum = 0;
          for (let i = 0; i < length; i++) {
            sum += digits[i] * (start - i);
          }
          const remainder = sum % 11;
          return remainder < 2 ? 0 : 11 - remainder;
        };
        const firstCheckDigit = calculateCheckDigit(digits, 10, 9);
        const secondCheckDigit = calculateCheckDigit(digits, 11, 10);
        if (firstCheckDigit !== digits[9] || secondCheckDigit !== digits[10]) {
          throw new Error('CPF inválido.');
        }
      },
    },
  },
  // NOVO CAMPO: Data de Nascimento
  dateOfBirth: {
    type: DataTypes.DATEONLY, // Usar DATEONLY para armazenar apenas a data
    allowNull: true, // Permitir null se não for obrigatório
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