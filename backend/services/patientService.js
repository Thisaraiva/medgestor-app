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

  // MANTEMOS estas checagens manuais porque são *regras de negócio*
  // aplicadas a um objeto existente. O Sequelize só valida o objeto
  // no momento do `update`, mas a lógica de "verificar se outro paciente
  // já tem aquele dado" é do Service.

  // --------------------------------------------------------------------------
  // MELHORIA: Podemos simplificar, removendo a duplicação de lógica aqui também
  // e confiar que o Sequelize vai fazer o check de UNIQUE, mas, ao atualizar,
  // o check manual com `Op.ne` é a maneira mais limpa de garantir que a 
  // restrição UNIQUE é aplicada corretamente APENAS em outros registros.
  // O `update` do Sequelize com `validate: true` faria o check, mas o `Op.ne`
  // garante uma mensagem específica para o cenário de "duplicidade em outro registro".
  // MANTENDO o padrão que já estava em update para evitar regressão.
  // --------------------------------------------------------------------------

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