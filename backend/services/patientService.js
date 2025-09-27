// backend/services/patientService.js

const { Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { Op } = require('sequelize');
// REMOVEMOS ESTA IMPORTAÇÃO, QUE CAUSAVA A REFERÊNCIA CIRCULAR:
// const { createPatientSchema } = require('../controllers/patientController');


const createPatient = async (data) => {
  // O Controller já validou o formato dos dados usando Joi.
  // Se chegamos aqui, os dados 'data' estão estruturados corretamente.
  // REMOVEMOS A VALIDAÇÃO REDUNDANTE QUE CAUSAVA O ERRO:
  /*
  const { error } = createPatientSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  */

  // MANTEMOS APENAS A VALIDAÇÃO DA REGRA DE NEGÓCIO (CPF duplicado)
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

  // Corrigimos para garantir que data.email existe e tem um valor antes de comparar
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