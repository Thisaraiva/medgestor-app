const asyncHandler = require('../middleware/controllerMiddleware');
const recordService = require('../services/recordService');
const { ValidationError } = require('../errors/errors');
const Joi = require('joi');

// Regex para validar o formato ISO 8601 completo (YYYY-MM-DDTHH:mm:ss.sssZ)
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const createSchema = Joi.object({
  patientId: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do paciente deve ser um UUID válido',
    'any.required': 'ID do paciente é obrigatório',
  }),
  appointmentId: Joi.string().uuid().optional().allow(null).messages({ // NOVO: appointmentId é opcional
    'string.uuid': 'ID do agendamento deve ser um UUID válido',
  }),
  diagnosis: Joi.string().min(1).required().messages({ // Diagnóstico é obrigatório e não pode ser vazio
    'string.min': 'Diagnóstico deve ter pelo menos 1 caractere',
    'any.required': 'Diagnóstico é obrigatório',
  }),
  treatment: Joi.string().allow(null, '').optional(),
  notes: Joi.string().allow(null, '').optional(),
  // A data será esperada no formato ISO 8601 (ex: "2025-07-10T10:30:00.000Z")
  date: Joi.string().pattern(ISO_8601_REGEX).required().messages({ // CORRIGIDO: Usando .pattern()
    'string.pattern.base': 'Data deve estar no formato ISO 8601 (ex: AAAA-MM-DDTHH:mm:ss.sssZ)',
    'any.required': 'Data é obrigatória',
  }),
});

// Schema para atualização de registro médico (todos os campos são opcionais)
const updateSchema = Joi.object({
  diagnosis: Joi.string().min(1).optional().messages({
    'string.min': 'Diagnóstico deve ter pelo menos 1 caractere',
  }),
  treatment: Joi.string().allow(null, '').optional(),
  notes: Joi.string().allow(null, '').optional(),
  date: Joi.string().pattern(ISO_8601_REGEX).optional().messages({ // CORRIGIDO: Usando .pattern()
    'string.pattern.base': 'Data deve estar no formato ISO 8601 (ex: AAAA-MM-DDTHH:mm:ss.sssZ)',
  }),
}).min(1); // Pelo menos um campo deve ser fornecido para atualização

const createRecord = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const record = await recordService.createRecord(value);
  res.status(201).json(record);
});

const getRecordsByPatient = asyncHandler(async (req, res) => {
  // Validação para os parâmetros de query de data
  const querySchema = Joi.object({
    startDate: Joi.string().pattern(ISO_8601_REGEX).optional().messages({
      'string.pattern.base': 'Data de início deve estar no formato ISO 8601',
    }),
    endDate: Joi.string().pattern(ISO_8601_REGEX).optional().messages({
      'string.pattern.base': 'Data de fim deve estar no formato ISO 8601',
    }),
  });
  const { error: queryError, value: queryValue } = querySchema.validate(req.query);
  if (queryError) {
    throw new ValidationError(queryError.details[0].message);
  }

  const records = await recordService.getRecordsByPatient(req.params.patientId, queryValue);
  res.status(200).json(records);
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id);
  res.status(200).json(record);
});

const updateRecord = asyncHandler(async (req, res) => {
  const { error, value } = updateSchema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    throw new ValidationError(error.details.map(x => x.message).join(', '));
  }
  const record = await recordService.updateRecord(req.params.id, value);
  res.status(200).json(record);
});

const deleteRecord = asyncHandler(async (req, res) => {
  await recordService.deleteRecord(req.params.id);
  res.status(204).send();
});


module.exports = { createRecord, getRecordsByPatient, getRecordById, updateRecord, deleteRecord };
