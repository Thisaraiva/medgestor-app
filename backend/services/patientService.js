// backend/services/patientService.js

const { Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { Op } = require('sequelize');
// REMOVEMOS ESTA IMPORTAÇÃO, QUE CAUSAVA A REFERÊNCIA CIRCULAR:
// const { createPatientSchema } = require('../controllers/patientController');


const createPatient = async (data) => {
  // O Controller já validou o formato dos dados usando Joi.
  // O Sequelize (e o BD) farão a validação UNIQUE para CPF e E-mail.
  // O errorMiddleware traduzirá o erro SequelizeUniqueConstraintError.

  // CÓDIGO REMOVIDO:
  // const existingPatient = await Patient.findOne({ where: { cpf: data.cpf } });
  // if (existingPatient) {
  // throw new ValidationError('CPF já registrado');
  // }

  // Deixamos apenas a criação. Se houver duplicidade (CPF ou Email), o Sequelize lança o erro.
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

  // Lógica de checagem de duplicidade em outros registros (mantida e aprimorada para clareza)

  // Checa se outro paciente já tem o novo CPF
  if (data.cpf && data.cpf !== patient.cpf) {
    const existingPatientWithCpf = await Patient.findOne({ where: { cpf: data.cpf, id: { [Op.ne]: id } } });
    if (existingPatientWithCpf) {
      throw new ValidationError('CPF já registrado para outro paciente');
    }
  }

  // Checa se outro paciente já tem o novo Email
  if (data.email && data.email !== patient.email && data.email !== '') {
    // Adicionamos 'data.email !== ''' para evitar que emails vazios causem erro se for UNIQUE(NULL)
    const existingPatientWithEmail = await Patient.findOne({ where: { email: data.email, id: { [Op.ne]: id } } });
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