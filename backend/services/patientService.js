const { Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { Op } = require('sequelize');
const Joi = require('joi');

const patientSchema = Joi.object({
  name: Joi.string().min(3).required(),
  // O Joi agora espera o CPF formatado com pontos e traço
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required().messages({
    'string.pattern.base': 'CPF deve estar no formato 000.000.000-00',
    'any.required': 'CPF é obrigatório',
  }),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  allergies: Joi.string().allow(null, ''),
});

const createPatient = async (data) => {
  const { error } = patientSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const existingPatient = await Patient.findOne({ where: { cpf: data.cpf } });
  if (existingPatient) {
    throw new ValidationError('CPF já registrado');
  }

  return Patient.create(data);
};

const getPatients = async ({ cpf, name }) => {
  const where = {};
  if (cpf) {
    where.cpf = cpf;
  }
  if (name) {
    where.name = { [Op.iLike]: `%${name}%` };
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

const updatePatient = async (id, data) => {
  const patient = await Patient.findByPk(id);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }

  // Valida os dados de atualização. Permite que CPF e nome não sejam alterados se não fornecidos.
  const { error } = patientSchema.validate(data, { abortEarly: false, allowUnknown: true });
  if (error) {
    throw new ValidationError(error.details.map(x => x.message).join(', '));
  }

  if (data.cpf && data.cpf !== patient.cpf) {
    const existingPatient = await Patient.findOne({ where: { cpf: data.cpf } });
    if (existingPatient) {
      throw new ValidationError('CPF já registrado');
    }
  }

  return patient.update(data);
};

const deletePatient = async (id) => {
  const patient = await Patient.findByPk(id);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }
  await patient.destroy();
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
