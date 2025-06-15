const { Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');

const validatePatient = ({ name, cpf }) => {
  if (!name || name.length < 3) {
    throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
  }
  if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
    throw new ValidationError('CPF deve estar no formato 123.456.789-00');
  }
};

const createPatient = async ({ name, cpf, email, phone, allergies }) => {
  validatePatient({ name, cpf });
  return Patient.create({ name, cpf, email, phone, allergies });
};

const getPatients = async ({ cpf, name }) => {
  const where = {};
  if (cpf) { 
    where.cpf = cpf; 
  }
  if (name) {
    where.name = { [Patient.sequelize.Op.iLike]: `%${name}%` };
  }
  return Patient.findAll({ where });
};

const getPatientById = async (id) => {
  const patient = await Patient.findByPk(id);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }
  return patient;
};

const updatePatient = async (id, { name, email, phone, allergies }) => {
  const patient = await Patient.findByPk(id);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }
  if (name || email) {
    validatePatient({ name: name || patient.name, cpf: patient.cpf });
  }
  return patient.update({ name, email, phone, allergies });
};

const deletePatient = async (id) => {
  const patient = await Patient.findByPk(id);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }
  await patient.destroy();
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };