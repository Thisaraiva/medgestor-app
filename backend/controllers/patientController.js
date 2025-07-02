// backend/controllers/patientController.js

const asyncHandler = require('../middleware/controllerMiddleware');
const patientService = require('../services/patientService');
const { ValidationError } = require('../errors/errors'); // Importe ValidationError e NotFoundError
const Joi = require('joi');

// Schema para criação de paciente (todos os campos necessários)
const createPatientSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.min': 'Nome deve ter pelo menos 3 caracteres',
    'any.required': 'Nome é obrigatório',
  }),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required().messages({
    'string.pattern.base': 'CPF deve estar no formato 000.000.000-00',
    'any.required': 'CPF é obrigatório',
  }),
  email: Joi.string().email().allow(null, '').messages({ // Permite null ou string vazia
    'string.email': 'Email deve ser válido',
  }),
  phone: Joi.string().allow(null, '').messages({ // Permite null ou string vazia
    'string.base': 'Telefone deve ser uma string',
  }),
  allergies: Joi.string().allow(null, '').messages({ // Permite null ou string vazia
    'string.base': 'Alergias deve ser uma string',
  }),
});

// Schema para atualização de paciente (todos os campos são opcionais)
const updatePatientSchema = Joi.object({
  name: Joi.string().min(3).messages({
    'string.min': 'Nome deve ter pelo menos 3 caracteres',
  }),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).messages({
    'string.pattern.base': 'CPF deve estar no formato 000.000.000-00',
  }),
  email: Joi.string().email().allow(null, '').messages({ // Permite null ou string vazia
    'string.email': 'Email deve ser válido',
  }),
  phone: Joi.string().allow(null, '').messages({ // Permite null ou string vazia
    'string.base': 'Telefone deve ser uma string',
  }),
  allergies: Joi.string().allow(null, '').messages({ // Permite null ou string vazia
    'string.base': 'Alergias deve ser uma string',
  }),
}).min(1); // Pelo menos um campo deve ser fornecido para atualização

// Função para criar paciente
exports.createPatient = asyncHandler(async (req, res) => {
  const { error, value } = createPatientSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message); // Usar ValidationError
  }
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
  const { error, value } = updatePatientSchema.validate(req.body, { abortEarly: false, allowUnknown: false }); // Usa o schema de atualização
  if (error) {
    throw new ValidationError(error.details.map(x => x.message).join(', ')); // Usar ValidationError
  }
  const updatedPatient = await patientService.updatePatient(id, value);
  res.status(200).json({ message: 'Paciente atualizado com sucesso!', patient: updatedPatient });
});

// Função para deletar paciente
exports.deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await patientService.deletePatient(id);
  res.status(200).json({ message: 'Paciente excluído com sucesso!' });
});
