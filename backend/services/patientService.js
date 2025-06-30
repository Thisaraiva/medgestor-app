// backend/services/patientService.js

const { Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { Op } = require('sequelize');
const Joi = require('joi'); 


const patientSchema = Joi.object({
  name: Joi.string().min(3).required(),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required().messages({
    'string.pattern.base': 'CPF deve estar no formato 000.000.000-00',
    'any.required': 'CPF é obrigatório',
  }),
  email: Joi.string().email().allow(null, ''),
  phone: Joi.string().allow(null, ''),
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

  if (data.cpf && data.cpf !== patient.cpf) {
    const existingPatientWithCpf = await Patient.findOne({ where: { cpf: data.cpf, id: { [Op.ne]: id } } }); // Adicionado Op.ne para excluir o próprio paciente
    if (existingPatientWithCpf) {
      throw new ValidationError('CPF já registrado para outro paciente');
    }
  }

  if (data.email && data.email !== patient.email) {
    const existingPatientWithEmail = await Patient.findOne({ where: { email: data.email, id: { [Op.ne]: id } } }); // Adicionado Op.ne para excluir o próprio paciente
    if (existingPatientWithEmail) {
      throw new ValidationError('Email já registrado para outro paciente');
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