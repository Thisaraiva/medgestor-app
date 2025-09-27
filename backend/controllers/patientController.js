// backend/controllers/patientController.js

const asyncHandler = require('../middleware/controllerMiddleware');
const patientService = require('../services/patientService');
const { ValidationError } = require('../errors/errors');
const Joi = require('joi');

// Definição de Schemas base para evitar repetição (DRY)
// Centralizando a definição de campos reutilizáveis
const nameSchema = Joi.string().min(3).messages({
  'string.min': 'Nome deve ter pelo menos 3 caracteres',
  'string.base': 'Nome deve ser uma string',
});

const cpfSchema = Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).messages({
  'string.pattern.base': 'CPF deve estar no formato 000.000.000-00',
  'string.base': 'CPF deve ser uma string',
});

const dateOfBirthSchema = Joi.string().isoDate().allow(null, '').messages({
    'string.isoDate': 'Data de Nascimento deve ser uma data válida (AAAA-MM-DD)',
    'string.base': 'Data de Nascimento deve ser uma string',
});

const emailSchema = Joi.string().email().allow(null, '').messages({
  'string.email': 'Email deve ser válido',
  'string.base': 'Email deve ser uma string',
});

const phoneSchema = Joi.string().allow(null, '').messages({
  'string.base': 'Telefone deve ser uma string',
});

const allergiesSchema = Joi.string().allow(null, '').messages({
  'string.base': 'Alergias deve ser uma string',
});


// Schema para criação de paciente (todos os campos necessários)
const createPatientSchema = Joi.object({
  name: nameSchema.required().messages({ 'any.required': 'Nome é obrigatório' }),
  cpf: cpfSchema.required().messages({ 'any.required': 'CPF é obrigatório' }),
  dateOfBirth: dateOfBirthSchema, // NOVO CAMPO
  email: emailSchema,
  phone: phoneSchema,
  allergies: allergiesSchema,
});

// Schema para atualização de paciente (todos os campos são opcionais)
const updatePatientSchema = Joi.object({
  name: nameSchema,
  cpf: cpfSchema,
  dateOfBirth: dateOfBirthSchema, // NOVO CAMPO
  email: emailSchema,
  phone: phoneSchema,
  allergies: allergiesSchema,
}).min(1); // Pelo menos um campo deve ser fornecido para atualização

// Exportamos os schemas para que o Service possa importá-los e usá-los, eliminando a repetição.
module.exports.createPatientSchema = createPatientSchema;
module.exports.updatePatientSchema = updatePatientSchema;

// Função para criar paciente
exports.createPatient = asyncHandler(async (req, res) => {
  const { error, value } = createPatientSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message); // Usar ValidationError
  }
  // No serviço, usaremos o 'value' validado.
  const newPatient = await patientService.createPatient(value);
  res.status(201).json(newPatient);
});

// Função para obter pacientes (pode ter filtros)
exports.getPatients = asyncHandler(async (req, res) => {
  const patients = await patientService.getPatients(req.query); // req.query pode conter cpf ou name
  res.status(200).json(patients);
});

// Função para obter paciente por ID
exports.getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id);
  res.status(200).json(patient);
});

// Função para atualizar paciente
exports.updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // A validação de atualização pode ser feita aqui, como já está.
  const { error, value } = updatePatientSchema.validate(req.body, { abortEarly: false, allowUnknown: false }); // Usa o schema de atualização
  if (error) {
    throw new ValidationError(error.details.map(x => x.message).join(', ')); // Usar ValidationError
  }
  // A validação de CPF/Email duplicado será feita no service
  const updatedPatient = await patientService.updatePatient(id, value);
  res.status(200).json({ message: 'Paciente atualizado com sucesso!', patient: updatedPatient });
});

// Função para deletar paciente
exports.deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await patientService.deletePatient(id);
  res.status(200).json({ message: 'Paciente excluído com sucesso!' });
});